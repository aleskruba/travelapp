import { useParams, useNavigate } from "react-router-dom";
import Button from "../customButton/Button";
import { fetchData } from "../../hooks/useFetchData";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../constants/config";
import { UserProps } from "../../types";
import moment from 'moment';
import { VscTriangleUp } from "react-icons/vsc";
import { VscTriangleDown } from "react-icons/vsc";
import ReactPaginate from 'react-paginate';
import { VscArrowLeft, VscArrowRight } from 'react-icons/vsc';

function UserDetail() {
  let { id } = useParams<string>();
  const navigate = useNavigate();
  const [backendError, setBackendError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProps | null>(null);
  const [openLoginDiv, setOpenLoginDiv] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); // State to manage current page
  const itemsPerPage = 5; // Number of login logs per page

  const url = `${BASE_URL}/admin/getuser/${id}`;

  const fetchUser = async () => {
    try {
      const response = await fetchData(url, "GET");
      const data = await response.json();
      setUser(data.user);
    } catch (err: any) {
      console.error(err);
      setBackendError(err ? err.message : "Něco se pokazilo");
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]); // Add `id` as a dependency to re-fetch if the URL param changes

  const handlePageChange = (selectedPage: { selected: number }) => {
    setCurrentPage(selectedPage.selected); // Update the current page when a page is selected
  };

  if (backendError) {
    return (
      <div className="text-center text-red-500">
        <p>{backendError}</p>
      </div>
    );
  }

  // Get the logs for the current page
  const pageCount = user?.loginLogs ? Math.ceil(user.loginLogs.length / itemsPerPage) : 0;
  const displayedLogs = user?.loginLogs.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto shadow-lg rounded-lg p-6">
        {/* Back Button */}
        <div className="flex justify-end mb-6">
          <Button onClick={() => navigate(-1)} color="gray">
            Zpět na výpis
          </Button>
        </div>

        {/* User Information */}
        <div className="space-y-6">
          <div className="text-2xl font-semibold">User Details</div>

          {/* User Information Section */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="font-medium">ID:</div>
            <div>{user?.id}</div>

            <div className="font-medium">Username:</div>
            <div>{user?.username}</div>

            <div className="font-medium">Full Name:</div>
            <div>{user?.firstName} {user?.lastName}</div>

            <div className="font-medium">Email:</div>
            <div>{user?.email}</div>

            <div className="font-medium">Registration Date:</div>
            <div>
              {user?.registrationDate
                ? moment(user.registrationDate).format('MMMM DD, YYYY')
                : 'N/A'}
            </div>

            <div className="font-medium">Is Admin:</div>
            <div>{user?.isAdmin ? "Yes" : "No"}</div>
          </div>

          <div className="flex justify-start">
            <img
              src={user?.image}
              alt="User Profile"
              className="w-32 h-32 rounded-full object-cover"
            />
          </div>

          {/* Login Logs Section */}
          <div>
            <div className="flex items-center gap-6 mt-6">
              <div className="text-xl font-semibold">Login Logs</div>
              <span>
                {!openLoginDiv ? (
                  <VscTriangleDown onClick={() => setOpenLoginDiv(true)} />
                ) : (
                  <VscTriangleUp onClick={() => setOpenLoginDiv(false)} />
                )}
              </span>
            </div>

            <div
              className={`mt-4 overflow-hidden transition-all duration-300 ease-in-out ${
                openLoginDiv ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {user?.loginLogs && user.loginLogs.length > 0 ? (
                <div className="space-y-4">
                  {displayedLogs?.map((log, index) => (
                    <div key={index} className="flex justify-between  rounded-lg shadow-sm ">
                      <div className="w-[120px] ">
                        <div className="font-medium ">IP Address:</div>
                        <div>{log.ipAddress}</div>
                      </div>
                      <div className="">
                     <div className="text-sm text-left">{new Date(log.timestamp).toLocaleString()}</div>
                     </div>
                      <div className="flex flex-col justify-center items-end">
                        <div
                          className={`px-3 py-1 rounded-full w-[120px] ${
                            log.status === "SUCCESS" ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                          {log.status}
                        </div>
                        <span className="text-xs">{log.status === "FAILURE" && log.failureReason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>No login logs available.</div>
              )}
           

            {/* Pagination */}
            {pageCount > 1 && (
              <div className="flex justify-center mt-6">
                <ReactPaginate
                  previousLabel={<VscArrowLeft />}
                  nextLabel={<VscArrowRight />}
                  breakLabel={"..."}
                  pageCount={pageCount}
                  onPageChange={handlePageChange}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={5}
                  containerClassName={"flex items-center space-x-2"}
                  pageClassName={"px-3 py-1 border border-gray-300 rounded-full cursor-pointer"}
                  pageLinkClassName={"italic"}
                  previousClassName={`px-3 py-1 border border-gray-300 rounded-full bold cursor-pointer ${currentPage === 0 ? ' cursor-not-allowed' : ''}`}
                  nextClassName={`px-3 py-1 border border-gray-300 rounded-full cursor-pointer ${currentPage === pageCount - 1 ? 'cursor-not-allowed' : ''}`}
                  activeClassName={"bg-blue-500 text-white"}
                  disabledClassName={" opacity-30 cursor-not-allowed"}
                />
              </div>
            )}

</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDetail;
