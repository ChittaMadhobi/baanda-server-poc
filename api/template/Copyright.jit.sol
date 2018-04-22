pragma solidity ^0.4.11;

contract Copyright {

   address owner;
   string  owneremail; 

  struct crecords {
    string filename;
    string shasha;
    string fileurl;
    string   datetime;
  }
  //crecords storedrecord;
  crecords[]  storedrecords;

  

  function Copyright(string _email) {
    // assignes the owner and owner's email at the time of deployment
    // These values would be coming as constructor
    owner = msg.sender;
    owneremail = _email;
  }

  // SetReocord  enters data for storage.
  function setRecords(string fn, string fsha, string furl, string dttm) returns (string, string, string, uint) {
   
    crecords memory mrec;
    
    mrec.filename = fn;   // File name
    mrec.shasha = fsha;   // Sha256 - 64 bits
    mrec.fileurl = furl;  // The file URL stored in the cloud
    mrec.datetime = dttm; // datetime of the file storage
    // mrec.datetime = "abcdefgh";
    storedrecords.push(mrec);

    // Pushing second record to test in testrpc to test / debug
    //mrec.filename = "filename abcd";
    //mrec.fileurl = "http://something.com/filename";
    //mrec.shasha = "x0980219844kdsadj9";
    //mrec.datetime = "2017-08-21";
    //mrec.datetime = "datetime";

    storedrecords.push(mrec); 

    string storage a0 = storedrecords[0].filename;
    string storage a1 = storedrecords[0].shasha;
    string storage a2 = storedrecords[0].fileurl;
    
    uint  sln = storedrecords.length;
    return (a0, a1, a2, sln);
  }

  // getRecord gets the record based on name. It returns url, hash, and date of recording 
  function getLatestRecord(string filename) returns (string, string, string, string, uint) {
   
   uint  lenofsr = storedrecords.length;
   uint  noofrec = 0;
   uint  flg = 0;
   string storage a01; //= storedrecords[0].filename;
   string storage a11; //= storedrecords[0].shasha;
   string storage a21; // = storedrecords[0].fileurl;
   string memory msg = "Success";
   for (uint i = lenofsr; i > 0; i-- ) {
       if (sha3(filename) == sha3(storedrecords[i].filename)) {
            noofrec++;
            if (flg == 0) {
                a01 = storedrecords[i].fileurl;
                a11 = storedrecords[i].shasha;
                a21 = storedrecords[i].datetime;
                flg = 1;
            }
       }  
   }

   if (flg == 0) {
       msg = "Error: No record found with the file name.";
   }
   // return url, hash, datetime, and no-of-rec with the file name
   return (a01, a11, a21, msg, lenofsr);
  }
  // Test if the owner email is stored
  function getOwnerContacts() returns (string, address) {
    return (owneremail, owner);
  }
  
}
