import React from "react";
import Modal from "react-modal";
import "./RejectCandidateModal.css";
import PropTypes from "prop-types";

Modal.setAppElement("#root");

function RejectCandidateModal({
  selectedCandidate,
  rejectionReasons,
  onReject,
  handleClose,
}) {
  return (
    <Modal
      isOpen={!!selectedCandidate}
      onRequestClose={handleClose}
      contentLabel="Reject Candidate"
      className="reject-modal"
      overlayClassName="modal-overlay"
    >
      <h2>Reject Candidate {selectedCandidate.name}</h2>
      {/* TODO: Move this select to another component and make its own state to manage the selected options
       * because when I open it again it shows the already selected options
       */}
      <select
        multiple
        value={selectedCandidate.selectedReasons}
        onChange={(e) => {
          const selectedOptions = Array.from(
            e.target.selectedOptions,
            (option) => option.value,
          );
          selectedCandidate.selectedReasons = selectedOptions;
        }}
        className="reasons-select"
      >
        {rejectionReasons.map((reason) => (
          <option key={reason} value={reason}>
            {reason}
          </option>
        ))}
      </select>
      <p>Use Control key to select multiple options from the list of reasons</p>
      <button
        onClick={() => {
          onReject(selectedCandidate.id, selectedCandidate.selectedReasons);
          handleClose();
        }}
        className="confirm-button"
      >
        Confirm Reject
      </button>
      <button onClick={handleClose} className="cancel-button">
        Cancel
      </button>
    </Modal>
  );
}

RejectCandidateModal.propTypes = {
  selectedCandidate: PropTypes.object,
  rejectionReasons: PropTypes.array,
  onReject: PropTypes.func,
  handleClose: PropTypes.func,
};

export default RejectCandidateModal;
