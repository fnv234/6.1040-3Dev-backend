# concept: HRAdmin

  **purpose**

    manage HR administrator authentication and account management,
    providing secure access control for HR administrative functions.

  **principle**

    HR administrators register with unique email addresses and passwords;
    passwords are hashed using SHA-256 for secure storage;
    authentication verifies credentials against stored hashes;
    the system provides account lookup while protecting password data
    and ensures email uniqueness for account creation.

  **state**

    a set of HRAdmins with
      an id HRAdminID
      an email String
      a password String // Hashed password

  **actions**

    registerHRAdmin (email: String, password: String): (hrAdmin: HRAdmin)
      **requires** email is unique and not empty, password is not empty
      **effects** creates a new HRAdmin with the given email and hashed password

    authenticateHRAdmin (email: String, password: String): (hrAdmin: HRAdmin)
      **requires** email and password are not empty
      **effects** verifies the credentials and returns the HRAdmin if valid

    getHRAdmin (hrAdminId: HRAdminID): (hrAdminData: HRAdmin)
      **requires** hrAdminId exists
      **effects** returns the HRAdmin data (excluding password)
