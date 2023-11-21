const express = require("express");
const cors = require("cors");
const { candidates, columns } = require("./testData");
const bodyParser = require("body-parser");

const app = express();
const port = 3003;

app.use(
  cors({
    origin: "http://localhost:3002",
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const rejectionReasons = ["Reason 1", "Reason 2", "Reason 3"];

app.get("/candidates", (req, res) => {
  if (!req.query.selectedFilters) return candidates;

  const selectedColumns = req.query?.selectedFilters?.split(",");

  const filteredCandidates = candidates.map((candidate) => {
    const filteredData = {};
    selectedColumns.forEach((column) => {
      filteredData[column] = candidate[column];
    });
    return filteredData;
  });

  res.json(filteredCandidates);
});

app.get("/columns", (req, res) => {
  res.json(columns);
});

app.post("/candidates/:candidateId/approve", (req, res) => {
  const { candidateId } = req.params || {};

  const candidate = candidates.find((c) => c.id === candidateId);
  if (candidate) {
    candidate.reason = [];
    res.status(200).json({ message: "Candidate approved successfully." });
  } else {
    res.status(404).json({ message: "Candidate not found." });
  }
});

app.get("/rejection-reasons", (req, res) => {
  res.json(rejectionReasons);
});

app.post("/candidates/:candidateId/reject", (req, res) => {
  const { candidateId } = req.params;
  console.log("🚀 ~ file: server.js:55 ~ app.post ~ req:", req);
  const { selectedReasons } = req.body;

  const candidate = candidates.find((c) => c.id === candidateId);

  if (candidate) {
    candidate.reason = candidate.reason.concat(selectedReasons);
    res.status(200).json({ message: "Candidate rejected successfully." });
  } else {
    res.status(404).json({ message: "Candidate not found." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
