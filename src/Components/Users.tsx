import { Search, PlusCircle, SquarePen, X, Loader2, User } from "lucide-react";
import { fromatDateWithTime, handleStatus } from "../utils/utils";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "../../store/store";
import { getAllUsersByPlantId } from "../../store/usersSlice";
import { Error } from "../utils/toast";
import type { UsersPlantIdResult } from "../../model/users-plantId.interface";
import NoDataFound from "./NoDataFound";
import AddUpdateUser from "./AddUpdateUser";
import Pagination from "./Pagination";

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UsersPlantIdResult[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UsersPlantIdResult[]>([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editUser, setEditUser] = useState<UsersPlantIdResult | null>(null);
  const plantId = localStorage.getItem("plantId");
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalItems = useMemo(() => {
    return filteredUsers.length;
  }, [filteredUsers]);

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / rowsPerPage);
  }, [totalItems, rowsPerPage]);

  const selectedRows = useMemo(() => {
    return filteredUsers.length;
  }, [filteredUsers]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const handleRowsPerPageChange = (rowsPerPage: number) => {
    setRowsPerPage(rowsPerPage);
    setCurrentPage(1);
  };

  const handlePaginatedData = (data: UsersPlantIdResult[]) => {
    return data.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  };

  const fetchUsers = () => {
    setIsLoading(true);
    dispatch(getAllUsersByPlantId(Number(plantId)))
      .unwrap()
      .then((res) => {
        if (res.success) {
          setUsers(res.data);
          setFilteredUsers(handlePaginatedData(res.data));
        } else {
          Error(res.message || "Failed to get users");
        }
      })
      .catch((err) => {
        console.log(err);
        Error(err.message || "Failed to get users");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleAddUser = () => {
    setEditUser(null);
    setIsAddUserOpen(true);
  };

  const handleEditUser = (user: UsersPlantIdResult) => {
    setEditUser(user);
    setIsAddUserOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddUserOpen(false);
    setEditUser(null);
  };

  const handleUserSuccess = () => {
    fetchUsers();
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          user.client_name.toLowerCase().includes(searchLower) ||
          user.client_email.toLowerCase().includes(searchLower) ||
          user.client_phone.toLowerCase().includes(searchLower) ||
          user.organization_name.toLowerCase().includes(searchLower) ||
          user.status.toLowerCase().includes(searchLower)
        );
      });
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  useEffect(() => {
    if (plantId) {
      fetchUsers();
    }
  }, [plantId]);

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex items-start md:items-center justify-end gap-2 md:gap-4 flex-col md:flex-row w-full">
        <div className="flex items-center justify-end gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search users..."
              className="md:w-96 w-48 pl-10 pr-4 py-1.5 text-text-secondary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm.trim() && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={handleAddUser}
            className="flex items-center gap-2 px-4 py-1.5 bg-linear-to-r text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto"
          >
            <PlusCircle className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-12 h-12 text-text-primary animate-spin" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex items-center justify-center h-full w-full">
          <NoDataFound
            icon={<User className="w-16 h-16 text-text-muted mx-auto mb-4" />}
            title={
              searchTerm.trim()
                ? "No user found matching your search"
                : "No users found"
            }
          />
        </div>
      ) : (
        <div className="relative overflow-auto shadow-sm rounded-lg pb-0 bg-primary flex-1">
          <div className="table-scrollbar overflow-x-auto overflow-y-auto h-[calc(100vh-305px)]">
            <table className="w-full text-sm text-left rtl:text-right text-text-primary">
              <thead className="text-xs text-text-primary uppercase bg-primary border-b border-border-primary sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-text-primary whitespace-nowrap text-start text-base font-roboto font-normal">
                    Sr No
                  </th>
                  <th className="px-6 py-3 text-text-primary whitespace-nowrap text-start text-base font-roboto font-normal">
                    Name
                  </th>
                  <th className="px-6 py-3 text-text-primary whitespace-nowrap text-start text-base font-roboto font-normal">
                    Email
                  </th>
                  <th className="px-6 py-3 text-text-primary whitespace-nowrap text-start text-base font-roboto font-normal">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-text-primary whitespace-nowrap text-start text-base font-roboto font-normal">
                    Organization
                  </th>

                  <th className="px-6 py-3 text-text-primary whitespace-nowrap text-start text-base font-roboto font-normal">
                    Status
                  </th>
                  <th className="px-6 py-3 text-text-primary whitespace-nowrap text-start text-base font-roboto font-normal">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-text-primary whitespace-nowrap text-start text-base font-roboto font-normal">
                    Updated At
                  </th>
                  <th className="px-6 py-3 text-text-primary whitespace-nowrap text-start text-base font-roboto font-normal">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {handlePaginatedData(filteredUsers)?.map((user, index) => (
                  <tr className="bg-primary border-b border-border-primary hover:bg-secondary">
                    <td className="px-6 py-4 text-start font-roboto text-text-secondary text-base">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4 font-roboto whitespace-nowrap text-start text-text-primary text-base">
                      {user.client_name}
                    </td>
                    <td className="px-6 py-4 font-roboto whitespace-nowrap text-start text-text-primary text-base">
                      {user.client_email}
                    </td>
                    <td className="px-6 py-4 font-roboto whitespace-nowrap text-start text-text-primary text-base">
                      {user.client_phone}
                    </td>
                    <td className="px-6 py-4 font-roboto whitespace-nowrap text-start text-text-primary text-base">
                      {user.organization_name}
                    </td>
                    <td className="px-6 py-4 font-roboto text-start text-text-primary text-base">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-normal capitalize ${handleStatus(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-roboto whitespace-nowrap text-start text-text-primary text-base">
                      {fromatDateWithTime(user.created_at)}
                    </td>
                    <td className="px-6 py-4 font-roboto whitespace-nowrap text-start text-text-primary text-base">
                      {fromatDateWithTime(user.updated_at)}
                    </td>
                    <td className="px-6 py-4 text-text-primary text-start font-roboto text-base whitespace-nowrap">
                      <div className="flex items-center gap-3 justify-center">
                        <SquarePen
                          className="w-5 h-5 text-status-info cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => handleEditUser(user)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages || 0}
            rowsPerPage={rowsPerPage}
            totalItems={totalItems}
            selectedRows={selectedRows || 0}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </div>
      )}

      <AddUpdateUser
        isOpen={isAddUserOpen}
        onClose={handleCloseModal}
        editUser={editUser}
        onSuccess={handleUserSuccess}
      />
    </div>
  );
};

export default Users;
