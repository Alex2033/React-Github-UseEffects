import React, { useEffect, useState } from "react";
import s from "./app.module.css";
import axios from "axios";

type SearchUserType = {
  login: string;
  id: number;
};

type SearchResult = {
  items: SearchUserType[];
};

type UserType = {
  login: string;
  id: number;
  avatar_url: string;
  followers: number;
};

type SearchPropsType = {
  value: string;
  onSubmit: (fixedValue: string) => void;
};

export const Search = (props: SearchPropsType) => {
  const [tempSearch, setTempSearch] = useState<string>("");

  useEffect(() => {
    setTempSearch(props.value);
  }, [props.value]);

  return (
    <div>
      <input
        onChange={(e) => setTempSearch(e.target.value)}
        value={tempSearch}
        type="text"
        placeholder="search"
      />
      <button
        onClick={() => {
          props.onSubmit(tempSearch);
        }}
      >
        find
      </button>
    </div>
  );
};

type UsersListPropsType = {
  term: string;
  selectedUser: SearchUserType | null;
  onUserSelect: (user: SearchUserType) => void;
};

const UsersList = (props: UsersListPropsType) => {
  const [users, setUsers] = useState<SearchUserType[]>([]);

  useEffect(() => {
    axios
      .get<SearchResult>(`https://api.github.com/search/users?q=${props.term}`)
      .then((res) => {
        setUsers(res.data.items);
      });
  }, [props.term]);

  return (
    <ul>
      {users.map((u) => (
        <li
          key={u.id}
          className={props.selectedUser === u ? s.selected : ""}
          onClick={() => {
            props.onUserSelect(u);
          }}
        >
          {u.login}
        </li>
      ))}
    </ul>
  );
};

type TimerProps = {
  seconds: number;
  onChange: (actualSeconds: number) => void;
  timerKey: string;
};

const initialTimerSeconds = 10;

const Timer = (props: TimerProps) => {
  const [seconds, setSeconds] = useState<number>(initialTimerSeconds);

  useEffect(() => {
    setSeconds(props.seconds);
  }, [props.seconds]);

  useEffect(() => {
    props.onChange(seconds);
  }, [seconds]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [props.timerKey]);

  return <div>{seconds}</div>;
};

type UserDetailPropsType = {
  user: SearchUserType | null;
};

const UserDetail = ({ user }: UserDetailPropsType) => {
  const [userDetails, setUserDetails] = useState<UserType | null>(null);
  const [seconds, setSeconds] = useState<number>(initialTimerSeconds);

  useEffect(() => {
    if (seconds < 1) {
      setUserDetails(null);
    }
  }, [seconds]);

  useEffect(() => {
    if (user) {
      axios
        .get<UserType>(`https://api.github.com/users/${user.login}`)
        .then((res) => {
          setSeconds(initialTimerSeconds);
          setUserDetails(res.data);
        });
    }
  }, [user]);

  return (
    <div>
      {userDetails && (
        <div>
          <Timer
            seconds={seconds}
            onChange={setSeconds}
            timerKey={userDetails.id.toString()}
          />
          <h2>{userDetails.login}</h2>
          <img src={userDetails.avatar_url} alt={userDetails.login} />
          <br />
          followers: {userDetails.followers}
        </div>
      )}
    </div>
  );
};

function App() {
  let initialSearchState = "it-kamasutra";

  const [selectedUser, setSelectedUser] = useState<SearchUserType | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchState);

  useEffect(() => {
    if (selectedUser) {
      document.title = selectedUser.login;
    }
  }, [selectedUser]);

  return (
    <div className={s.container}>
      <div>
        <Search
          value={searchTerm}
          onSubmit={(value: string) => {
            setSearchTerm(value);
          }}
        />
        <button onClick={() => setSearchTerm(initialSearchState)}>Reset</button>
        <UsersList
          term={searchTerm}
          selectedUser={selectedUser}
          onUserSelect={setSelectedUser}
        />
      </div>
      <div>
        <h2>Username</h2>

        <UserDetail user={selectedUser} />
      </div>
    </div>
  );
}

export default App;
