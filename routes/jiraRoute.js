const express = require("express");
const {
  getIssueTypes,
  getIssueFields,
  getIssueTransitions,
  addIssue,
  updateIssue,
  handleWebhook,
  getIssue,
  getIssueEditMeta,
} = require("../controllers/jiraController");
const router = express.Router();

router.post("/", addIssue);

router.post("/webhook", handleWebhook);

router.get("/issue-types", getIssueTypes);

router.get("/issue-fields", getIssueFields);

router.get("/:id", getIssue);

router.get("/:id/issue-transitions", getIssueTransitions);

router.get("/:id/issue-editmeta", getIssueEditMeta);

router.put("/:id", updateIssue);

module.exports = router;
