import { signIn, signOut, useSession } from "next-auth/react";

const Home = () => {
  const { data: session, status } = useSession();

  console.log(session);
  if (status === "loading") {
    return <main>Loading...</main>;
  }

  return (
    <>
      <h1>Guestbook</h1>
      {session ? (
        <>
          <div>
            <p>hi {session.user?.name}</p>
            <img src={session.user?.image!} alt="" />
          </div>
          <button onClick={() => signOut()}>Logout</button>
        </>
      ) : (
        <button onClick={() => signIn("discord")}> Login with Discord</button>
      )}
    </>
  );
};

export default Home;
