import React from "react";
import { IoMdCheckmark } from "react-icons/io";


const Badge = (props) => {
  return (
    <span
      className={`inline-flex items-center justify-center gap-1 py-1 px-4 rounded-full text-[11px] capitalize ${props.status === "pending" && "bg-primary text-white"
        } ${props.status === "confirm" && "bg-green-500 text-white"} ${props.status === "delivered" && "bg-green-700 text-white"}`}
    >
      {
        props.status === "delivered"  &&
        <>
          <IoMdCheckmark size={13} />
        </>

      }
      {props.status}

    </span>
  );
};

export default Badge;
