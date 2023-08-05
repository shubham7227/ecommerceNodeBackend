const { default: axios } = require("axios");

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

module.exports = {
  addIssue,
  getIssueTypes,
  getIssueFields,
  getIssueTransitions,
  updateIssue,
};
