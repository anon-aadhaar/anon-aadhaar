// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "../interfaces/IAnonAadhaarVerifier.sol";

contract Vote {
    // Structure to hold proposal information
    struct Proposal {
        string description;
        uint256 voteCount;
    }
    string public votingQuestion;
    address public anonAadhaarVerifierAddr;

    event Voted(address indexed _from, uint256 indexed _propositionIndex);

    // List of proposals
    Proposal[] public proposals;

    // Mapping to track if an address has already voted
    mapping(uint256 => bool) public hasVoted;
    // This can be replaced by the nullifier
    // Nullifier can be accessed by calling _pubSignals[0]
    // mapping(uint256 => bool) public hasVoted;

    // Constructor to initialize proposals
    constructor(string memory _votingQuestion, string[] memory proposalDescriptions, address _verifierAddr) {
        anonAadhaarVerifierAddr = _verifierAddr;
        votingQuestion = _votingQuestion;
        for (uint256 i = 0; i < proposalDescriptions.length; i++) {
            proposals.push(Proposal(proposalDescriptions[i], 0));
        }
    }

    function verify(uint256[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[5] calldata _pubSignals) public view returns (bool) {
        return IAnonAadhaarVerifier(anonAadhaarVerifierAddr).verifyProof(_pA, _pB, _pC, _pubSignals);
    }

    // Function to vote for a proposal
    function voteForProposal(uint256 proposalIndex, uint256[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[5] calldata _pubSignals) public {
        require(proposalIndex < proposals.length, "Invalid proposal index");
        require(!hasVoted[_pubSignals[0]], "You have already voted");
        require(verify(_pA, _pB, _pC, _pubSignals), "Your idendity proof is not valid");

        proposals[proposalIndex].voteCount++;
        hasVoted[_pubSignals[0]] = true;

        emit Voted(msg.sender, proposalIndex);
    }

    // Function to get the total number of proposals
    function getProposalCount() public view returns (uint256) {
        return proposals.length;
    }

    // Function to get proposal information by index
    function getProposal(uint256 proposalIndex) public view returns (string memory, uint256) {
        require(proposalIndex < proposals.length, "Invalid proposal index");

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