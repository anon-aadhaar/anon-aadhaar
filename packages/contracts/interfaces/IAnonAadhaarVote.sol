// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

interface IAnonAadhaarVote {

    struct Proposal {
        string description;
        uint256 voteCount;
    }

    event Voted(address indexed _from, uint256 indexed _propositionIndex);

    function voteForProposal(uint256 proposalIndex, uint identityNullifier, uint userNullifier, uint timestamp, uint signal, uint[8] memory groth16Proof ) external;

    function getProposalCount() external returns (uint256);

    function getTotalVotes() external returns (uint256);
}