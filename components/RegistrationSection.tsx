"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/formatDate";
import { isDayDisabled } from "@/utils/formatDate";
import { registrationSchema } from "@/utils/schema";
import { Spinner } from "./ui/spinner";

export type ScheduleMap = string[];

export const RegistrationSection = ({
  setDate,
  handleNextStep,
  selectDateOptions,
}: {
  setDate: (data: string) => void;
  handleNextStep: () => void;
  selectDateOptions: string[];
}) => {
  const [loading, setLoading] = useState(false);
  const [fetchTimeLoading, setFetchTimeLoading] = useState(false);
  const [selectTimeOptions, setSelectTimeOptions] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      date: "",
      time: "",
      email: "",
      phone: "",
    },
  });

  const selectedDate = watch("date");
  const selectedTime = watch("time");

  // ---------------- Fetch available time for date ----------------

  const fetchAvailableTimeOptions = async (newDate: string) => {
    try {
      setFetchTimeLoading(true);
      const res = await fetch(`/api/available_times?date=${newDate}`);
      const data = await res.json();

      if (data.status === "success") {
        setSelectTimeOptions(data.times);
      } else {
        toast.error("Хуваарь авахад алдаа гарлаа");
      }
    } catch {
      toast.error("Хуваарь авахад алдаа гарлаа");
    } finally {
      setFetchTimeLoading(false);
    }
  };

  // ---------------- Submit ----------------
  const onSubmit = async (data: z.infer<typeof registrationSchema>) => {
    try {
      setLoading(true);
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setDate(`${data.date}  ${data.time} ${data.email}`);

      const result = await res.json();

      result.status === "success"
        ? toast.success("Амжилттай бүртгэгдлээ 🎉")
        : toast.error(result.message);
    } catch {
      toast.error("Алдаа гарлаа");
    } finally {
      setLoading(false);
      handleNextStep();
    }
  };

  const handleDateChange = async (date?: Date) => {
    if (!date) return;
    const newDate = formatDate(date);

    setValue("date", newDate);
    fetchAvailableTimeOptions(newDate);
  };

  return (
    <div>
      <p className="font-bold text-2xl mt-4 text-center">
        ✅ Schedule Consultation
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-4">
        {/* Date */}
        <p className="font-semibold">
          Date <span className="text-red-500">*</span>
        </p>
        <div className="flex justify-center">
          <Calendar
            className="p-0 w-full"
            mode="single"
            selected={new Date(selectedDate)}
            onSelect={handleDateChange}
            modifiers={{
              highlighted: (date) =>
                !isDayDisabled(date, selectDateOptions) &&
                date.toDateString() !== new Date(selectedDate)?.toDateString(),
              selected: (date) =>
                date.toDateString() === new Date(selectedDate)?.toDateString(),
            }}
            modifiersClassNames={{
              selected: "[&]:text-white [&]:bg-primary hover:bg-primary",
              highlighted: "bg-blue-100 [&]:text-primary border-green-700",
            }}
            disabled={(date) => isDayDisabled(date, selectDateOptions)}
            classNames={{
              month: "space-y-4 mx-3 md:mx-6 w-full",

              head_row: "grid grid-cols-7 w-full text-slate-500",
              row: "grid grid-cols-7 w-full mt-1",
              day_outside: "opacity-50",
              cell: "h-13 text-center text-sm relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: cn(
                buttonVariants({ variant: "ghost" }),
                "h-13 font-normal aria-selected:opacity-100 text-slate-500 data-[selected-single=true]:bg-[#1F6A63] data-[selected-single=true]:text-white",
              ),
            }}
            today={new Date()}
          />
        </div>
        <div className="flex gap-4 justify-center">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-blue-100"></div>
            <span className="text-sm text-slate-900">Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-primary"></div>
            <span className="text-sm text-slate-900">Selected</span>
          </div>
        </div>

        {/* Time */}
        <p className="mt-8 font-semibold">
          Time <span className="text-red-500">*</span>
        </p>

        <div className="h-[40px]">
          {/* Loading */}
          {fetchTimeLoading && <Spinner width={60} />}

          {/* No date selected */}
          {!fetchTimeLoading && selectTimeOptions.length < 1 && (
            <p className="text-sm">Please select a date first</p>
          )}

          {/* Time options */}
          {!fetchTimeLoading && selectTimeOptions && (
            <div className="flex justify-between">
              {selectTimeOptions.map((time) => (
                <Button
                  key={time}
                  type="button"
                  variant="outline"
                  className={
                    selectedTime === time ? "bg-primary text-white" : ""
                  }
                  onClick={() => setValue("time", time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <p className="font-semibold mt-8">
          Info <span className="text-red-500">*</span>
        </p>
        <Input placeholder="Email" {...register("email")} />
        <Input placeholder="Phone number" {...register("phone")} />

        <Button disabled={loading} className="w-full bg-blue-500 text-white">
          {loading ? <Spinner /> : "Book Now"}
        </Button>
      </form>
    </div>
  );
};
