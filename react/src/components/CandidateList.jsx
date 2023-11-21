import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./CandidateList.css";
import RejectCandidateModal from "./RejectCandidateModal";

const defaultSelectedFilters = [
  "id",
  "name",
  "phone",
  "email",
  "experience",
  "skills",
  "desired_salary",
  "reason",
];

function CandidateList() {
  const [selectedFilters, setSelectedFilters] = useState(
    JSON.parse(localStorage.getItem("selectedFilters")) ||
      defaultSelectedFilters,
  );

  const [availableColumns, setAvailableColumns] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [rejectionReasons, setRejectionReasons] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const refreshCandidates = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:3003/candidates", {
        params: {
          selectedFilters: selectedFilters.join(","),
        },
      });
      setCandidates(response.data);
    } catch (error) {
      console.error("Error while refreshing candidates:", error);
    }
  }, [selectedFilters]);

  const handleApproveCandidate = useCallback(
    async (candidateId) => {
      try {
        await axios.post(
          `http://localhost:3003/candidates/${candidateId}/approve`,
        );

        const copyCandidates = [...candidates];
        setCandidates(
          copyCandidates.reduce((acc, candidate) => {
            if (candidate.id === candidateId) {
              candidate.reason = [];
            }
            return [...acc, candidate];
          }, []),
        );

        // refreshCandidates();
      } catch (error) {
        console.error("Error while approving candidate:", error);
      }
    },
    [candidates],
    // [candidates, refreshCandidates]
  );

  const handleRejectCandidate = useCallback(
    async (candidateId, selectedReasons) => {
      try {
        const response = await axios.post(
          `http://localhost:3003/candidates/${candidateId}/reject`,
          selectedReasons,
        );

        // Updating locally the candidate's reason
        if (response.status === 200) {
          const copyCandidates = candidates.map((candidate) => {
            if (candidate.id === candidateId) {
              return {
                ...candidate,
                // Possibility of adding reasons to the existing ones, we have the same on the API
                // TODO: Check for exixting reasons with .split(",") and .join(",") to avoid duplicates
                reason: candidate.reason.concat(selectedReasons),
              };
            }
            return candidate;
          });

          setCandidates(copyCandidates);
        }

        // refreshCandidates();
      } catch (error) {
        console.error("Error while rejecting candidate:", error);
      }
    },
    [candidates],
    // [candidates, refreshCandidates]
  );

  useEffect(() => {
    axios.get("http://localhost:3003/columns").then((response) => {
      setAvailableColumns(response.data);
    });
  }, []);

  useEffect(() => {
    refreshCandidates();
    localStorage.setItem("selectedFilters", JSON.stringify(selectedFilters));
  }, [refreshCandidates, selectedFilters]);

  useEffect(() => {
    axios.get("http://localhost:3003/rejection-reasons").then((response) => {
      setRejectionReasons(response.data);
    });
  }, []);

  return (
    <div className="container">
      <h1>Selected Filters:</h1>
      <ul>
        {/* TODO: Hide id column header */}
        {Object.keys(availableColumns).map((column) => (
          <li key={column}>
            <input
              type="checkbox"
              value={column}
              checked={selectedFilters.includes(column)}
              onChange={(e) => {
                const columnName = e.target.value;
                if (e.target.checked) {
                  setSelectedFilters([...selectedFilters, columnName]);
                } else {
                  setSelectedFilters(
                    selectedFilters.filter((filter) => filter !== columnName),
                  );
                }
              }}
            />
            {column}
          </li>
        ))}
      </ul>
      <h1>Candidates:</h1>
      <table>
        <thead>
          <tr>
            {selectedFilters.map((filter) => (
              <th key={filter}>{filter}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate, index) => (
            <tr key={index}>
              {/* TODO: Hide id column */}
              {selectedFilters.map((filter) => (
                <td key={filter}>{candidate[filter]}</td>
              ))}
              <td>
                {/* Possibility of manual approval for already-approved cantidate and posibility
                 * of manual rejection for already-rejected candidate to add more rejection reasons
                 */}
                <button onClick={() => handleApproveCandidate(candidate.id)}>
                  Approve
                </button>
                <button onClick={() => setSelectedCandidate(candidate)}>
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedCandidate && (
        <RejectCandidateModal
          selectedCandidate={selectedCandidate}
          rejectionReasons={rejectionReasons}
          onReject={handleRejectCandidate}
          handleClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}

export default CandidateList;
