pragma solidity ^0.8.0;

contract Project {

    struct userData {
        uint storageOffered;
        uint numFiles;
        uint balanceFromUser;
        mapping(string => string) file_Ids;   
    }

    uint fileCost = 200;

    mapping(address => userData) public users;
    
    mapping(string => string[]) public shardLocations;

    address payable public owner;

    constructor() {
        owner = payable(msg.sender);
    }

    //we assume that the ethereum address of the user uniquely identifies them from a specific system

    function addUser(address user) public {
        users[user].storageOffered = 0;
    }

    function receive() external payable {
        users[msg.sender].balanceFromUser += msg.value;

        uint contractBalance = address(this).balance;

        owner.transfer(contractBalance);
    }

    function changeStorageOffered(address user, uint storageInMB) public {
        users[user].storageOffered = storageInMB;
    }

    function addFile(address user, string memory file_Id, string memory fileHash) public {
        require(users[user].balanceFromUser >= (users[user].numFiles + 1) * fileCost, "Not enough balance to store the file.");

        users[user].file_Ids[file_Id] = fileHash;
        users[user].numFiles++;
    }

    function viewFileHash(string memory file_Id) public returns(string memory) {
        return users[msg.sender].file_Ids[file_Id];
    }

    function addShardLocation(string memory file_Id, string memory shardLocation) public {
        shardLocations[file_Id].push(shardLocation);
    }
}