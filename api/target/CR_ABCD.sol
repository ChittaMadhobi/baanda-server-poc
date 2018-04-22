pragma solidity ^ 0.4.14;
/**
 * @author M.Reddy <reddy@f42labs.com>
 * date: 10/22/2017
 * Simple CR_ABCD Contract and abstracted CRUD functions.
 */
contract CR_ABCD {

    address theOwnerAddress;
    string theOwnerEmail;

    function CR_ABCD(string _email) {
        theOwnerAddress = msg.sender;
        theOwnerEmail = _email;
    }

    function setOwner(string _email) public returns(bool) {
        theOwnerEmail = _email;
        return true;
    }

    function getOwner() constant returns(address ownerAddress, string ownerEmail) {
        return (theOwnerAddress, theOwnerEmail);
    }

    function unpackDoc(Document _doc) private constant returns(string documentName, string documentType, string documentURL, string documentSHA, uint256 documentCreationTimestamp, uint256 documentLastUpdatedTimestamp) {
        return (_doc.documentName, _doc.documentType, _doc.documentURL, _doc.documentSHA, _doc.documentCreationTimestamp, _doc.documentLastUpdatedTimestamp);
    }

    //@todo figure a way to return array in case of multiple docs, until then last matched contract with the condition is returned
    function getContractByName(string _documentName) public constant returns(string documentName, string documentType, string documentURL, string documentSHA, uint256 documentCreationTimestamp, uint256 documentLastUpdatedTimestamp) {
        for (uint i = 0; i < Documents.length; i++) {
            if (checkEqual(Documents[i].documentName, _documentName)){
              return unpackDoc(Documents[i]);
            }
        }
    }

    //@todo figure a way to return array in case of multiple docs, until then last matched contract with the condition is returned
    function getContractByDate(uint256 _startDateTime, uint256 _endDateTime) public constant returns(string documentName, string documentType, string documentURL, string documentSHA, uint256 documentCreationTimestamp, uint256 documentLastUpdatedTimestamp) {
        for (uint i = 0; i < Documents.length; i++) {
            if (Documents[i].documentCreationTimestamp >= _startDateTime && Documents[i].documentCreationTimestamp <= _endDateTime)
              return unpackDoc(Documents[i]);
        }
    }

    function getContractByIndex(uint index) public constant returns(string documentName, string documentType, string documentURL, string documentSHA, uint256 documentCreationTimestamp, uint256 documentLastUpdatedTimestamp) {
        if (index > Documents.length) 
            return;
        return unpackDoc(Documents[index]);
    }

    struct Document {
        string documentName;
        string documentType;
        string documentURL;
        string documentSHA;
        uint256 documentCreationTimestamp;
        uint256 documentLastUpdatedTimestamp;
    }

    Document[] Documents;

    function addContract(string _documentName, string _documentType, string _documentURL, string _documentSHA, uint256 _documentCreationTimestamp, uint256 _documentLastUpdatedTimestamp) public returns(uint rowNumber) {
        Document memory newDocument;
        newDocument.documentName = _documentName;
        newDocument.documentType = _documentType;
        newDocument.documentURL = _documentURL;
        newDocument.documentSHA = _documentSHA;
        newDocument.documentCreationTimestamp = _documentCreationTimestamp;
        newDocument.documentLastUpdatedTimestamp = _documentLastUpdatedTimestamp;
        Documents.push(newDocument);
        return Documents.length;
    }

    function updateContract(address _ownerAddress, string _oldDocumentName, string _newDocumentName) public returns(bool contractUpdated) {
        bool updateSuccess = false;
        if (_ownerAddress == theOwnerAddress) {
            for (uint i = 0; i < Documents.length; i++) {
                if (checkEqual(Documents[i].documentName, _oldDocumentName)) {
                    Documents[i].documentName = _newDocumentName;
                    updateSuccess = true;
                }
            }
        }
        return updateSuccess;
    }

    function deleteAllContracts(address _ownerAddress) public constant returns(bool deleted) {
      if ( Documents.length == 0) 
            return;

      bool deleteSuccess = false;
      if (_ownerAddress == theOwnerAddress) {
          for (uint i = 0; i < Documents.length; i++) {
                  removeDocument(i);
                  deleteSuccess = true;
              }
          }
          return deleteSuccess;
      }

    function deleteContract(address _ownerAddress, string _documentName) public returns(bool contractDeleted) {
        bool deleteSuccess = false;
        if (_ownerAddress == theOwnerAddress) {
            for (uint i = 0; i < Documents.length; i++) {
                if (checkEqual(Documents[i].documentName, _documentName)) {
                    //delete(Documents[i]);
                    removeDocument(i);
                    deleteSuccess = true;
                }
            }
        }
        return deleteSuccess;
    }

    function getContractCount() public constant returns(uint documentCount) {
        return Documents.length;
    }


    function getLastContract() public constant returns(string documentName, string documentType, string documentURL, string documentSHA, uint256 documentCreationTimestamp, uint256 documentLastUpdatedTimestamp) {
      if ( Documents.length == 0) 
            return;
      return unpackDoc(Documents[Documents.length - 1]);
    }

    //util function to compare strings by breaking down to bytes
    function compare(string _a, string _b) private returns(int) {
        bytes memory a = bytes(_a);
        bytes memory b = bytes(_b);
        uint minLength = a.length;
        if (b.length < minLength) 
            minLength = b.length;
        //@todo unroll the loop into increments of 32 and do full 32 byte comparisons
        for (uint i = 0; i < minLength; i++) {
            if (a[i] < b[i])
                return -1;
            else if (a[i] > b[i])
            return 1;
        if (a.length < b.length)
            return -1;
        else if (a.length > b.length)
            return 1;
        else
            return 0;
        }
    }
    /// @dev Compares two strings and returns true iff they are equal.
    function checkEqual(string _a, string _b) private returns(bool) {
        return compare(_a, _b) == 0;
    }

    //todo cleanup plugging array gap further
    function removeDocument(uint index) private {
        if (index >= Documents.length) 
            return;

        for (uint i = index; i < Documents.length - 1; i++) {
            Documents[i] = Documents[i + 1];
        }
        delete Documents[Documents.length - 1];
        Documents.length--;
    }
}
