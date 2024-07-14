"use client";

import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("@/app/components/LeafletMap"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <DynamicMap />
    </>
  );
}
