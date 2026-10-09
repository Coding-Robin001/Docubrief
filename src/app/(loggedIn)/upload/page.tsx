import UploadHeader from "@/components/upload/uploadHeader";
import UploadForm from "@/components/upload/uploadForm";
import UploadFooter from "@/components/upload/uploadFooter";
import { getCurrentUserQuota } from "@/lib/uploadLimit";

export default async function UploadPage() {
  const quota = await getCurrentUserQuota();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-bg)] font-body">
      {/* same soft radial wash as the hero, for continuity across pages */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          background:
            "radial-gradient(55% 45% at 12% 8%, var(--color-mist) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-2xl px-6 pb-28 pt-24 md:pt-32">
        <UploadHeader />
        <UploadForm quota={quota} />
        <UploadFooter />
      </div>
    </main>
  );
}

// import UploadHeader from "@/components/upload/uploadHeader";
// import UploadForm from "@/components/upload/uploadForm";
// import UploadFooter from "@/components/upload/uploadFooter";

// export default function UploadPage() {
//   return (
//     <main className="relative min-h-screen overflow-hidden bg-[var(--color-bg)] font-body">
//       {/* same soft radial wash as the hero, for continuity across pages */}
//       <div
//         className="pointer-events-none absolute inset-0 opacity-[0.35]"
//         style={{
//           background:
//             "radial-gradient(55% 45% at 12% 8%, var(--color-mist) 0%, transparent 60%)",
//         }}
//       />

//       <div className="relative mx-auto max-w-2xl px-6 pb-28 pt-24 md:pt-32">
//         <UploadHeader />
//         <UploadForm />
//         <UploadFooter />
//       </div>
//     </main>
//   );
// }