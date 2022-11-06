import { signIn, signOut, useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import { useState } from "react";
import Image from "next/image";

const Messages = () => {
  const { data: messages, isLoading } = trpc.guestbook.getAll.useQuery();

  if (isLoading) return <div>Fetching Messages...</div>;

  return (
    <>
      <div className="flex flex-col gap-4">
        {messages?.map((msg, index) => {
          return (
            <div key={index}>
              <Image
                className="mask mask-circle"
                src={msg.profilePic}
                alt=""
                width={100}
                height={100}
                layout={"fixed"}
              />
              <p>{msg.message}</p>
              <span> -{msg.name}</span>
            </div>
          );
        })}
      </div>
    </>
  );
};

const Form = () => {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const utils = trpc.useContext();
  const postMessage = trpc.guestbook.postMessage.useMutation({
    onMutate: () => {
      utils.guestbook.getAll.cancel();
      const optimisticUpdate = utils.guestbook.getAll.getData();

      if (optimisticUpdate) {
        utils.guestbook.getAll.setData(optimisticUpdate);
      }
    },
    onSettled: () => {
      utils.guestbook.getAll.invalidate();
    },
  });

  return (
    <>
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();

          if (session !== null) {
            postMessage.mutate({
              name: session.user?.name as string,
              message,
              profilePic: session.user?.image as string,
            });
          }

          setMessage("");
        }}
      >
        <input
          type="text"
          value={message}
          placeholder="Your message..."
          minLength={2}
          maxLength={100}
          onChange={(event) => setMessage(event.target.value)}
          className="bg-neutral-900 rounded-md border-2 border-zinc-800 px-4 py-2 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md border-2 border-zinc-800 p-2 focus:outline-none"
        >
          Submit
        </button>
      </form>
    </>
  );
};
const Home = () => {
  const { data: session, status } = useSession();

  console.log(session);
  if (status === "loading") {
    return <main className="flex flex-col items-center pt-4">Loading...</main>;
  }

  return (
    <main className="flex flex-col items-center">
      <h1 className="pt-4 text-3xl">Guestbook</h1>
      <p>
        Tutorial for <code>Grant</code>
      </p>

      <div className="pt-10">
        {session ? (
          <div>
            <p>hi {session.user?.name}</p>
            <Image
              className="mask mask-circle"
              src={session.user?.image!}
              alt=""
              layout={"fixed"}
              width={100}
              height={100}
            />
            <button onClick={() => signOut()}>Logout</button>
            <div className="pt-6">
              <Form />
            </div>
            <div className="pt-10">
              <Messages />
            </div>
          </div>
        ) : (
          <div>
            <button onClick={() => signIn("discord")}>
              Login with Discord
            </button>
            <div className="pt-10">
              <Messages />
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;
