// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import '../../interfaces/IAnonAadhaar.sol';
import '../../interfaces/IAnonAadhaarVote.sol';

contract AnonAadhaarVote is IAnonAadhaarVote {
    string public votingQuestion;
    address public anonAadhaarVerifierAddr;

    // List of proposals
    Proposal[] public proposals;

    // Mapping to track if a userNullifier has already voted
    mapping(uint256 => bool) public hasVoted;

    // Constructor to initialize proposals
    constructor(
        string memory _votingQuestion,
        string[] memory proposalDescriptions,
        address _verifierAddr
    ) {
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

    /// @dev Check if the timestamp is more recent than (current time - 3 hours)
    /// @param timestamp: msg.sender address.
    /// @return bool
    function isLessThan3HoursAgo(uint timestamp) public view returns (bool) {
        return timestamp > (block.timestamp - 3 hours);
    }

    /// @dev Register a vote in the contract.
    /// @param proposalIndex: Index of the proposal you want to vote for.
    /// @param nullifierSeed: Nullifier Seed used while generating the proof.
    /// @param nullifier: Nullifier for the user's Aadhaar data.
    /// @param timestamp: Timestamp of when the QR code was signed.
    /// @param signal: signal used while generating the proof, should be equal to msg.sender.
    /// @param revealArray: Array of the values used to reveal data, if value is 1 data is revealed, not if 0.
    /// @param groth16Proof: SNARK Groth16 proof.
    function voteForProposal(
        uint256 proposalIndex,
        uint nullifierSeed,
        uint nullifier,
        uint timestamp,
        uint signal,
        uint[4] calldata revealArray, 
        uint[8] calldata groth16Proof
    ) public {
        require(
            proposalIndex < proposals.length,
            '[AnonAadhaarVote]: Invalid proposal index'
        );
        require(
            addressToUint256(msg.sender) == signal,
            '[AnonAadhaarVote]: Wrong user signal sent.'
        );
        require(
            isLessThan3HoursAgo(timestamp),
            '[AnonAadhaarVote]: Proof must be generated with Aadhaar data signed less than 3 hours ago.'
        );
        require(
            IAnonAadhaar(anonAadhaarVerifierAddr).verifyAnonAadhaarProof(
                nullifierSeed, // nullifier seed
                nullifier,
                timestamp,
                signal,
                revealArray,
                groth16Proof
            ),
            '[AnonAadhaarVote]: The proof sent is not valid.'
        );
        // Check that user hasn't already voted
        require(
            !hasVoted[nullifier],
            '[AnonAadhaarVote]: User has already voted'
        );

        proposals[proposalIndex].voteCount++;
        hasVoted[nullifier] = true;

        emit Voted(msg.sender, proposalIndex);
    }

    // Function to get the total number of proposals
    function getProposalCount() public view returns (uint256) {
        return proposals.length;
    }

    // Function to get proposal information by index
    function getProposal(
        uint256 proposalIndex
    ) public view returns (string memory, uint256) {
        require(
            proposalIndex < proposals.length,
            '[AnonAadhaarVote]: Invalid proposal index'
        );

        Proposal memory proposal = proposals[proposalIndex];
        return (proposal.description, proposal.voteCount);
    }

    // Function to get the total number of votes across all proposals
    function getTotalVotes() public view returns (uint256) {
        uint256 totalVotes = 0;
        uint256 proposalLength = proposals.length;
        for (uint256 i = 0; i < proposalLength; i++) {
            totalVotes += proposals[i].voteCount;
        }
        return totalVotes;
    }

    // Function to check if a user has already voted
    function checkVoted(uint256 _nullifier) public view returns (bool) {
        return hasVoted[_nullifier];
    }
}
