import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useChatStore } from "../../store/useChatStore";

const Search = () => {
  const { users, query, setFilteredUsers, setQuery } = useChatStore();

  useEffect(() => {
    if (query.trim()) {
      const newUsers = [...users].filter((user) =>
        user.fullName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(newUsers);
    } else {
      setFilteredUsers([]);
    }
  }, [query]);

  return (
    <div className="relative py-2 px-3 rounded-lg bg-slate-200 w-full flex items-center">
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
  );
};

export default Search;
