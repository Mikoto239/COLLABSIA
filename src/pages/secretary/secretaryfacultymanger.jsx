import React, { useState, useEffect } from 'react';
import HeaderDashboard from '../../components/headerdashboard';
import Footer from '../../components/footer';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../App.css';

const Secretaryfacultymanager = () => {
  const [userprofile, usersetProfile] = useState([]);
  const [activeMenuItem, setActiveMenuItem] = useState('InviteMember'); 
  const [editMode, setEditMode] = useState(false);
  const [updatedrole, setUpdatedrole] = useState();
  const [editedUser, setEditedUser] = useState(null);
  const [isconfirmationopen, setConfirmationopen] = useState(false);
  const [isDeleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const handleSearch = (event) => {
    const { value } = event.target;
    setSearchQuery(value);
  };

  const filteredUsers = userprofile.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteUser = () => {
    setDeleteConfirmationOpen(true);
  };

  const handleConfirmDelete = (userrole) => {
    handleConfirmDeleteuser(userrole);
    handleConfirmationClose();
  };

  const handleConfirmationClosedelete = () => {
    setDeleteConfirmationOpen(false);
  };

  const handleConfirmation = () => {
    setConfirmationopen(true);
  };

  const handleConfirmationClose = () => {
    setConfirmationopen(false);
  };

  const handleConfirmSend = (userrole) => {
    handleUpdaterole(userrole);
    handleConfirmationClose();
  };

  const handleMenuItemClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  const token = localStorage.getItem('token');

  const handleItemClick = (value) => {
    setLoading(true);
    let url = '';
    switch (value) {
      case 'BSIT':
        url = 'https://collabsiaserver.onrender.com/api/getallbsit';
        break;
      case 'BSAT':
        url = 'https://collabsiaserver.onrender.com/api/getallbsat';
        break;
      case 'BSFT':
        url = 'https://collabsiaserver.onrender.com/api/getallbsft';
        break;
      case 'BSET':
        url = 'https://collabsiaserver.onrender.com/api/getallbset';
        break;
      case 'ALL':
        url = 'https://collabsiaserver.onrender.com/api/getallusers';
        break;
      case 'ROLE':
        url = 'https://collabsiaserver.onrender.com/api/role';
        break;
      default:
        break;
    }

    if (url) {
      axios.get(url)
        .then((response) => {
          usersetProfile(response.data.users || response.data.bsituser || response.data.bsatuser || response.data.bsftuser || response.data.bsetuser || response.data.baseonrole);
          setLoading(false);
          toast.success(`${value} MEMBERS`);
        })
        .catch((error) => {
          console.error('Error fetching users:', error);
          setLoading(false);
          toast.error('Error fetching users');
        });
    }
  };

  useEffect(() => {
    axios.get('https://collabsiaserver.onrender.com/api/getallusers')
      .then((response) => {
        usersetProfile(response.data.users);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        setLoading(false);
        toast.error('Error fetching users');
      });
  }, []);

  const handleConfirmDeleteuser = async (userrole) => {
    try {
      const getMeResponse = await fetch('https://collabsiaserver.onrender.com/api/getme', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (getMeResponse.status === 200 && getMeResponse.ok) {
        const result = await getMeResponse.json();
        const editorrole = result.user.role;

        if (editorrole === 2 && userrole === 1) {
          toast.error('You cannot delete this user!');
        } else if (editedUser.email === result.user.email) {
          toast.error('You cannot delete your own account!');
        } else {
          await axios.post('https://collabsiaserver.onrender.com/api/deletethisuser', { email: editedUser.email });

          usersetProfile((prevProfiles) =>
            prevProfiles.filter((user) => user.email !== editedUser.email)
          );

          toast.success('User deleted successfully');
        }
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user' + editedUser.email);
    } finally {
      setDeleteConfirmationOpen(false);
    }
  };

  const handleUpdaterole = async (userrole) => {
    try {
      const getMeResponse = await fetch('https://collabsiaserver.onrender.com/api/getme', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (getMeResponse.status === 200 && getMeResponse.ok) {
        const result = await getMeResponse.json();
        const editorrole = result.user.role;

        if (editorrole === 2 && userrole === 1) {
          toast.error('You cannot edit this user role!');
        } else {
          const updateRoleResponse = await axios.post('https://collabsiaserver.onrender.com/api/updateuserrole', {
            email: editedUser.email,
            role: updatedrole
          });

          if (updateRoleResponse.status === 200 && updateRoleResponse.data.success) {
            const getUsersResponse = await axios.get('https://collabsiaserver.onrender.com/api/getallusers');
            const updatedUser = getUsersResponse.data.users.find(user => user.email === editedUser.email);

            usersetProfile(getUsersResponse.data.users);

            let updatedRoleName;
            if (updatedUser.role === 1) {
              updatedRoleName = 'Admin';
            } else if (updatedUser.role === 2) {
              updatedRoleName = 'Secretary';
            } else if (updatedUser.role === 3) {
              updatedRoleName = 'User';
            }

            setEditMode(false);
            setUpdatedrole(updatedRoleName);
            toast.success('Role updated successfully. Updated role for ' + editorrole);
          } else {
            console.error('Role update failed:', updateRoleResponse.data.message);
            toast.error('Role update failed');
          }
        }
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Error updating role why');
    }
  };

  const getRoleName = (role) => {
    switch (role) {
      case 1:
        return 'Admin';
      case 2:
        return 'Secretary';
      case 3:
        return 'User';
      default:
        return 'Unregistered User';
    }
  };

  const handleEditUser = (user) => {
    setEditMode(true);
    setEditedUser(user);
    setUpdatedrole(user.role);
  };

  return (
    <>
      <HeaderDashboard />
      <div className="content-header">
        <div>
          <h1>Faculty Manager</h1>
        </div>
        <div>
          <input
            type="text"
            placeholder="Search by name"
            value={searchQuery}
            onChange={handleSearch}
            className="search"
          />
        </div>
      </div>
      <div className="dashboard">
        <div className="sidebar">
          <ul>
            <li className={activeMenuItem === 'Dashboard' ? 'active' : ''}>
              <a onClick={() => handleMenuItemClick('Dashboard')} href="Dashboard">
                Dashboard
              </a>
            </li>
            <li className={activeMenuItem === 'Memo Manager' ? 'active' : ''}>
              <a onClick={() => handleMenuItemClick('Memo Manager')} href="memo_manager">
                Memo Manager
              </a>
            </li>
            <li className={activeMenuItem === 'Calendar' ? 'active' : ''}>
              <a onClick={() => handleMenuItemClick('Calendar')} href="calendar">
                Calendar
              </a>
            </li>
            <li className={activeMenuItem === 'Faculty Manager' ? 'active' : ''}>
              <a onClick={() => handleMenuItemClick('Faculty Manager')} href="faculty_manager">
                Faculty Manager
              </a>
            </li>
            <li className={activeMenuItem === 'Report List' ? 'active' : ''}>
              <a onClick={() => handleMenuItemClick('Report List')} href="report_list">
                Report List
              </a>
            </li>
          </ul>
        </div>
        <div className="content">
          <h1>List of Members</h1>
          <div className="dropdownfaculty">
            <button className="dropbtnfaculty">Filter</button>
            <div className="dropdown-content">
              <div onClick={() => handleItemClick('ALL')}>ALL</div>
              <div onClick={() => handleItemClick('BSIT')}>BSIT</div>
              <div onClick={() => handleItemClick('BSAT')}>BSAT</div>
              <div onClick={() => handleItemClick('BSET')}>BSET</div>
              <div onClick={() => handleItemClick('BSFT')}>BSFT</div>
              <div onClick={() => handleItemClick('ROLE')}>ROLE</div>
            </div>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            filteredUsers.map((user, index) => (
              <div key={index}>
                <br />
                <ul>
                  <li className="details-lists">
                    Picture: <img className="user-picture" src={user.picture} alt="User" />
                  </li>
                  <li className="details-lists">Name: {user.name}</li>
                  <li className="details-lists">Email: {user.email}</li>
                  <li className="details-lists">Role: {getRoleName(user.role)}</li>
                  <li className="details-lists">
                    {editMode && editedUser && user.email === editedUser.email ? (
                      <>
                        Updated Role:
                        <div className="dropdown">
                          <button type="button" className="dropbtn">
                            {getRoleName(updatedrole)}
                          </button>
                          <div className="dropdown-content">
                            <div onClick={() => setUpdatedrole(2)}>Secretary</div>
                            <div onClick={() => setUpdatedrole(3)}>User</div>
                          </div>
                        </div>
                        <button className="editbutton" type="button" onClick={handleConfirmation}>
                          Update
                        </button>
                        <button className="editbutton" onClick={handleDeleteUser}>
                          Delete
                        </button>
                        {isconfirmationopen && (
                          <div className="confirmation-modal">
                            <div className="modal-content">
                              <p>Are you sure you want to update the role of this user?</p>
                              <button onClick={() => handleConfirmSend(user.role)}>Yes</button>
                              <button onClick={handleConfirmationClose}>No</button>
                            </div>
                          </div>
                        )}
                        {isDeleteConfirmationOpen && (
                          <div className="confirmation-modal">
                            <div className="modal-content">
                              <p>Are you sure you want to delete this user?</p>
                              <button onClick={() => handleConfirmDelete(user.role)}>Yes</button>
                              <button onClick={handleConfirmationClosedelete}>No</button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <button className="editbutton" onClick={() => handleEditUser(user)}>
                        Edit Role
                      </button>
                    )}
                  </li>
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Secretaryfacultymanager;
