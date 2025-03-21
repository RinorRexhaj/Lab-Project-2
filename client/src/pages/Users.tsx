import { useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { UsersResponse } from "../types/response/UsersResponse";
import { User } from "../types/User";
import Loading from "./Loading";

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { get, loading } = useApi();

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    const response: UsersResponse = await get("/user");
    setUsers(response.users);
  };

  return (
    <div className="max-w-7xl p-3 w-11/12 flex flex-col gap-5">
      <h1 className="font-semibold text-2xl">Users</h1>
      {loading ? (
        <Loading />
      ) : (
        <div className="flex flex-col gap-2">
          {users.map((user) => (
            <p key={user.email}>
              {user.fullName}: {user.email}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default Users;
