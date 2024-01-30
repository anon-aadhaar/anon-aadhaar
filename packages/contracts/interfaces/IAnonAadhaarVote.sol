// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

interface IAnonAadhaarVote {

    struct Proposal {
        string description;
        uint256 voteCount;
    }

    event Voted(address indexed _from, uint256 indexed _propositionIndex);
}