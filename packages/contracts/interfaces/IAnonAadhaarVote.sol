// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

interface IAnonAadhaarVote {

    struct Proposal {
        string description;
        uint256 voteCount;
    }

    event Voted(address indexed _from, uint256 indexed _propositionIndex);

    function voteForProposal(uint256 proposalIndex, uint256[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[5] calldata _publicInputs, uint256 signal) external;

    function getProposalCount() external returns (uint256);

    function getTotalVotes() external returns (uint256);
}