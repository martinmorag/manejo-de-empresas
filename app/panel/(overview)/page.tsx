"use client";

import { useSession } from 'next-auth/react';

const Page = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (!session) {
    return <p>You are not signed in.</p>;
  }

  return (
    <div>
    </div>
  );
};

export default Page;