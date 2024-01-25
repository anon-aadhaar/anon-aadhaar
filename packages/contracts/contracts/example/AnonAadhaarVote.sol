// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import "../../interfaces/IAnonAadhaar.sol";
import "../../interfaces/IAnonAadhaarVote.sol";

contract AnonAadhaarVote is IAnonAadhaarVote {
    string public votingQuestion;
    address public anonAadhaarVerifierAddr;

    // List of proposals
    Proposal[] public proposals;

    // Mapping to track if a nullifier has already voted
    // userNullifier can be accesses in _pubInputs => _pubInputs[1]
    mapping(uint256 => bool) public hasVoted;

    // Constructor to initialize proposals
    constructor(string memory _votingQuestion, string[] memory proposalDescriptions, address _verifierAddr) {
        anonAadhaarVerifierAddr = _verifierAddr;
        votingQuestion = _votingQuestion;
        for (uint256 i = 0; i < proposalDescriptions.length; i++) {
            proposals.push(Proposal(proposalDescriptions[i], 0));
        }
    }

    /// @dev Convert an address to uint256, used to check against signal.
    /// @param _addr: msg.sender address.
    /// @return Address msg.sender's address in uint256
    function addressToUint256(address _addr) private pure returns (uint256) {
        return uint256(uint160(_addr));
    }

    /// @dev Register a vote in the contract.
    /// @param proposalIndex: Index of the proposal you want to vote for.
    /// @param a: a.
    /// @param b: b.
    /// @param c: c.
    /// @param publicInputs: Public Inputs .
    /// @param signal: signal used while generating the proof, should be equal to msg.sender.
    function voteForProposal(uint256 proposalIndex, uint256[2] calldata a, uint[2][2] calldata b, uint[2] calldata c, uint[5] calldata publicInputs, uint256 signal) public {
        require(proposalIndex < proposals.length, "[AnonAadhaarVote]: Invalid proposal index");
        require(addressToUint256(msg.sender) == signal, "[AnonAadhaarVote]: wrong user signal sent.");
        require(IAnonAadhaar(anonAadhaarVerifierAddr).verifyAnonAadhaarProof(a, b, c, publicInputs, signal) == true, "[AnonAadhaarVote]: proof sent is not valid.");
        // Check that user hasn't already voted
        // _pubSignals[1] refers to userNullifier
        require(!hasVoted[publicInputs[1]], "[AnonAadhaarVote]: User has already voted");

        proposals[proposalIndex].voteCount++;
        hasVoted[publicInputs[1]] = true;

        emit Voted(msg.sender, proposalIndex);
    }

    // Function to get the total number of proposals
    function getProposalCount() public view returns (uint256) {
        return proposals.length;
    }

    // Function to get proposal information by index
    function getProposal(uint256 proposalIndex) public view returns (string memory, uint256) {
        require(proposalIndex < proposals.length, "[AnonAadhaarVote]: Invalid proposal index");

        Proposal memory proposal = proposals[proposalIndex];
        return (proposal.description, proposal.voteCount);
    }

    // Function to get the total number of votes across all proposals
    function getTotalVotes() public view returns (uint256) {
        uint256 totalVotes = 0;
        for (uint256 i = 0; i < proposals.length; i++) {
            totalVotes += proposals[i].voteCount;
        }
        return totalVotes;
    }    

    // Function to check if a user has already voted
    function checkVoted(uint256 _nullifier) public view returns (bool) {
        return hasVoted[_nullifier];
    } 
}