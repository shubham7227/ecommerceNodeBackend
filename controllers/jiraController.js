const { default: axios } = require("axios");
const orderModel = require("../models/orderModel");

const username = process.env.JIRA_USERNAME;
const apiKey = process.env.JIRA_API_KEY;
const JIRA_API = axios.create({
  baseURL: process.env.JIRA_URL,
});

const auth = `Basic ${Buffer.from(username + ":" + apiKey).toString("base64")}`;

const addIssue = async (req, res) => {
  try {
    const { summary, description } = req.body;
    const fieldData = {
      fields: {
        project: {
          key: process.env.PROJECT_KEY,
        },
        summary: summary,
        description: {
          content: [
            {
              content: [
                {
                  text: description,
                  type: "text",
                },
              ],
              type: "paragraph",
            },
          ],
          type: "doc",
          version: 1,
        },
        issuetype: {
          id: "10004",
        },
      },
    };

    const { data } = await JIRA_API.post("/rest/api/3/issue", fieldData, {
      headers: {
        Authorization: auth,
      },
    });
    console.log(data.key);
    res.status(200).json({ data: data });
  } catch (err) {
    console.log(err.response.data);
    res.status(500).json({ message: err.message });
  }
};

const getIssue = async (req, res) => {
  try {
    const key = req.params.id;

    const { data } = await JIRA_API.get(`/rest/api/3/issue/${key}`, {
      headers: {
        Authorization: auth,
      },
    });

    res.status(200).json({ data: data });
  } catch (err) {
    console.log(err.response.data);
    res.status(500).json({ message: err.message });
  }
};

const updateIssue = async (req, res) => {
  try {
    const issueId = req.params.id;

    const fieldData = {
      transition: {
        id: "3",
      },
    };
    const { data } = await JIRA_API.post(
      `/rest/api/3/issue/${issueId}/transitions`,
      fieldData,
      {
        headers: {
          Authorization: auth,
        },
      }
    );
    res.status(200).json({ data: data, message: "Issue transitioned" });
  } catch (err) {
    console.log(err.response.data);
    res.status(500).json({ message: err.message });
  }
};

const getIssueTypes = async (req, res) => {
  try {
    const { data } = await JIRA_API.get("/rest/api/3/issue/createmeta", {
      headers: {
        Authorization: auth,
      },
    });
    res.status(200).json({ data: data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

const getIssueFields = async (req, res) => {
  try {
    const { data } = await JIRA_API.get("/rest/api/3/field", {
      headers: {
        Authorization: auth,
      },
    });
    res.status(200).json({ data: data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

const getIssueTransitions = async (req, res) => {
  try {
    const issueId = req.params.id;

    // 3 === PLACED => Processing
    // 4 === Placed => Cancelled
    // 4 === Processing => CANCELLED
    // 2 === Processing => Delivered
    const { data } = await JIRA_API.get(
      `/rest/api/3/issue/${issueId}/transitions`,
      {
        headers: {
          Authorization: auth,
        },
      }
    );
    res.status(200).json({ data: data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

const getIssueEditMeta = async (req, res) => {
  try {
    const issueId = req.params.id;

    const { data } = await JIRA_API.get(
      `/rest/api/3/issue/${issueId}/editmeta`,
      {
        headers: {
          Authorization: auth,
        },
      }
    );
    res.status(200).json({ data: data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const { timestamp, webhookEvent, issue, changelog } = req.body;

    // jira:issue_created
    // jira:issue_updated
    // jira:issue_deleted

    // 10009 ===> Processing
    // 10010 ===> Cancelled
    // 10004 ===> Delivered
    // 10003 ===> Placed

    const statusIdMapping = {
      10003: "Placed",
      10009: "Processing",
      10004: "Delivered",
      10010: "Cancelled",
    };

    const issueKey = issue.key;
    const statusId = issue.fields.status.id;
    const newStatus = statusIdMapping[statusId];

    if (
      webhookEvent === "jira:issue_updated" &&
      changelog &&
      changelog.items.find((entry) => entry.fieldId === "status")
    ) {
      const orderData = await orderModel.findOne({ jiraIssueKey: issueKey });

      if (orderData) {
        if (orderData.status !== newStatus) {
          const isoTimestamp = new Date(timestamp).toISOString();

          await orderModel.findByIdAndUpdate(orderData._id, {
            status: newStatus,
            deliveredDate: newStatus === "Delivered" ? isoTimestamp : undefined,
            cancelledDate: newStatus === "Cancelled" ? isoTimestamp : undefined,
          });
          console.log(
            `${issueKey} data sucessfully updated in database by jira webhook event`
          );
        } else {
          console.log("Status is same");
        }
      } else {
        console.log("Order not found");
      }
    } else {
      console.log(`${webhookEvent} event received`);
      console.log(changelog);
    }

    res.status(200).json({ message: "success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addIssue,
  getIssue,
  getIssueTypes,
  getIssueFields,
  getIssueTransitions,
  getIssueEditMeta,
  updateIssue,
  handleWebhook,
};
