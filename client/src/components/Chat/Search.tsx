import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useChatUsersStore } from "../../store/useChatUsersStore";
import useApi from "../../hooks/useApi";
import { useUserStore } from "../../store/useUserStore";
import User from "./User";

const Search = () => {
  const { users, query, filteredUsers, setFilteredUsers, setQuery } =
    useChatUsersStore();
  const { user } = useUserStore();
  const { get, loading } = useApi();

  useEffect(() => {
    getUsers();
  }, [query]);

  const getUsers = async () => {
    if (query.trim()) {
      const { users } = await get(`/chat/users`, {
        id: user?.id,
        page: 1,
        query,
      });
      setFilteredUsers(users.users);
    } else {
      setFilteredUsers([]);
    }
  };

  const mapUsers = () => {
    let newUsers = [];
    if (loading)
      return <h1 className="text-center font-semibold mt-8">Loading...</h1>;
    if (query || filteredUsers.length > 0) newUsers = [...filteredUsers];
    else newUsers = [...users];
    if (newUsers.length > 0) {
      return newUsers.map((user) => {
        return <User user={user} key={"chat-user-" + user.id} />;
      });
    } else {
      return (
        <h1 className="text-center font-semibold mt-8">
          {query ? "No users found..." : "Start a conversation..."}
        </h1>
      );
    }
  };

  return (
    <>
      <div className="fixed w-[350px] sm:w-[320px] z-50 py-2 px-3 rounded-lg bg-slate-200 flex items-center">
        <FontAwesomeIcon icon={faMagnifyingGlass} />
        {/* Search Input */}
        <input
          type="text"
          className="w-full px-2 bg-transparent focus:outline-none"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query.trim() && (
          <FontAwesomeIcon
            icon={faXmark}
            className="cursor-pointer"
            onClick={() => setQuery("")}
          />
        )}
      </div>
      <div className="relative flex flex-col gap-1 h-80 mt-10 overflow-y-auto overflow-x-hidden">
        {mapUsers()}
      </div>
    </>
  );
};

export default Search;
