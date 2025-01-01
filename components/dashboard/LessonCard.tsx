import { ChevronRightIcon } from "@heroicons/react/20/solid";

interface Person {
  name: string;
  email: string;
  role: string;
  imageUrl: string;
  href: string;
  lastSeen: string | null;
  lastSeenDateTime?: string;
}

const people: Person[] = [
  {
    name: "Leslie Alexander",
    email: "leslie.alexander@example.com",
    role: "Co-Founder / CEO",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    href: "#",
    lastSeen: "3h ago",
    lastSeenDateTime: "2023-01-23T13:23Z",
  },
  {
    name: "Michael Foster",
    email: "michael.foster@example.com",
    role: "Co-Founder / CTO",
    imageUrl:
      "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    href: "#",
    lastSeen: "3h ago",
    lastSeenDateTime: "2023-01-23T13:23Z",
  },
  {
    name: "Dries Vincent",
    email: "dries.vincent@example.com",
    role: "Business Relations",
    imageUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    href: "#",
    lastSeen: null,
  },
  {
    name: "Lindsay Walton",
    email: "lindsay.walton@example.com",
    role: "Front-end Developer",
    imageUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    href: "#",
    lastSeen: "3h ago",
    lastSeenDateTime: "2023-01-23T13:23Z",
  },
  {
    name: "Courtney Henry",
    email: "courtney.henry@example.com",
    role: "Designer",
    imageUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    href: "#",
    lastSeen: "3h ago",
    lastSeenDateTime: "2023-01-23T13:23Z",
  },
  {
    name: "Tom Cook",
    email: "tom.cook@example.com",
    role: "Director of Product",
    imageUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    href: "#",
    lastSeen: null,
  },
];

export default function LessonCard() {
  return (
    <ul
      role="list"
      className="overflow-hidden bg-white divide-y divide-gray-100 rounded-md shadow-sm ring-1 ring-gray-900/5"
    >
      {people.map((person) => (
        <li
          key={person.email}
          className="relative flex justify-between px-4 py-5 gap-x-6 hover:bg-gray-50 sm:px-6"
        >
          <div className="flex min-w-0 gap-x-4">
            <img
              alt=""
              src={person.imageUrl}
              className="flex-none rounded-full size-12 bg-gray-50"
            />
            <div className="flex-auto min-w-0">
              <p className="font-semibold text-gray-900 text-sm/6">
                <a href={person.href}>
                  <span className="absolute inset-x-0 bottom-0 -top-px" />
                  {person.name}
                </a>
              </p>
              <p className="flex mt-1 text-gray-500 text-xs/5">
                <a
                  href={`mailto:${person.email}`}
                  className="relative truncate hover:underline"
                >
                  {person.email}
                </a>
              </p>
            </div>
          </div>
          <div className="flex items-center shrink-0 gap-x-4">
            <div className="hidden sm:flex sm:flex-col sm:items-end">
              <p className="text-gray-900 text-sm/6">{person.role}</p>
              {person.lastSeen ? (
                <p className="mt-1 text-gray-500 text-xs/5">
                  Last seen{" "}
                  <time dateTime={person.lastSeenDateTime}>
                    {person.lastSeen}
                  </time>
                </p>
              ) : (
                <div className="mt-1 flex items-center gap-x-1.5">
                  <div className="flex-none p-1 rounded-full bg-emerald-500/20">
                    <div className="size-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-gray-500 text-xs/5">Online</p>
                </div>
              )}
            </div>
            <ChevronRightIcon
              aria-hidden="true"
              className="flex-none text-gray-400 size-5"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
