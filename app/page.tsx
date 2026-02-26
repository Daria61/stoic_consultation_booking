"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { InformationSection } from "@/components/InformationSection";
import { RegistrationSection } from "@/components/RegistrationSection";
import { SuccessSection } from "@/components/SuccessSection";
import { toast } from "sonner";
import { Loader } from "@/components/Loader";
import { Calendar, MapPin, Link } from "lucide-react";

export type ScheduleMap = string[];

export default function Home() {
  const [step, setStep] = useState(0);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [selectDateOptions, setSelectDateOptions] = useState<ScheduleMap>([]);
  const [date, setDate] = useState("");

  // ---------------- Fetch available date ----------------
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setFetchLoading(true);
        const res = await fetch("/api/available");
        const data = await res.json();

        if (data.status === "success") {
          setSelectDateOptions(data.dates);
        } else {
          toast.error("Хуваарь авахад алдаа гарлаа");
        }
      } catch {
        toast.error("Хуваарь авахад алдаа гарлаа");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const handleNextStep = () => {
    setStep((prev) => prev + 1);
  };

  // Use array instead of object
  const stepComponents = [
    <InformationSection key="info" handleNextStep={handleNextStep} />,
    <RegistrationSection
      key="reg"
      setDate={setDate}
      handleNextStep={handleNextStep}
      selectDateOptions={selectDateOptions}
    />,
    <SuccessSection key="success" date={date} />,
  ];

  if (fetchLoading) {
    return <Loader />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="relative w-[480px] min-h-screen bg-black overflow-hidden">
        {/* Poster image */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 h-[560px] w-[480px]">
          <Image src="/stoic.png" alt="poster" fill className="object-cover" />
        </div>

        {/* Content */}
        <div className="relative z-10 mt-[400px] bg-white rounded-t-3xl px-4 py-6">
          {stepComponents[step]}
        </div>
      </div>
    </div>
  );
}
