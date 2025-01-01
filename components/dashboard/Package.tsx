"use client";

const studentPackage = {
  title: "Private Classes (8 lesson package)",
  language: "Portuguese - 60 min x 8",
  scheduledLessons: 5,
  totalLessons: 8,
  expiresIn: 26,
  teacherImage: "https://via.placeholder.com/40", // Mock image URL
};

import Avatar from "@/components/Avatar";

const Package = () => {
  return (
    <div className="w-full px-4 py-5 bg-white rounded-md shadow-sm gap-x-6 sm:px-6 ring-1 ring-gray-900/5">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-500">ACTIVE PACKAGE</p>
          <h2 className="text-lg font-bold text-gray-900">
            {studentPackage.title}
          </h2>
          <p className="text-sm text-gray-500">{studentPackage.language}</p>
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          <p className="text-sm text-gray-500">
            Expires in {studentPackage.expiresIn} days
          </p>{" "}
          <Avatar
            src={studentPackage.teacherImage}
            alt="Teacher"
            width={40}
            height={40}
          />
        </div>
      </div>
      <div className="py-5 mt-6 border-t border-gray-900/5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">Scheduled Lessons</p>
          <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
            <p className="font-bold">{studentPackage.scheduledLessons}</p> / <p>{studentPackage.totalLessons}</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
          <div
            className="bg-primary h-2.5 rounded-full"
            style={{
              width: `${
                (studentPackage.scheduledLessons /
                  studentPackage.totalLessons) *
                100
              }%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Package;
