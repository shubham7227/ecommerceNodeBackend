const { default: axios } = require("axios");

const username = process.env.JIRA_USERNAME;
const apiKey = process.env.JIRA_API_KEY;
const JIRA_API = axios.create({
  baseURL: process.env.JIRA_URL,
});

const auth = `Basic ${Buffer.from(username + ":" + apiKey).toString("base64")}`;

const addNewIssueJira = async ({ summary, description }) => {
  try {
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
    return data.key;
  } catch (err) {
    console.log(err.response.data);
  }
};

const updateIssueJira = async ({ issueKey, transitionId }) => {
  try {
    const fieldData = {
      transition: {
        id: transitionId,
      },
    };
    await JIRA_API.post(
      `/rest/api/3/issue/${issueKey}/transitions`,
      fieldData,
      {
        headers: {
          Authorization: auth,
        },
      }
    );
    console.log("Issue Transitioned");
    return true;
  } catch (err) {
    console.log(err.response.data);
  }
};

module.exports = {
  addNewIssueJira,
  updateIssueJira,
};
