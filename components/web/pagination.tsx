import React from 'react'

type Props = {}

const Pagination = (props: Props) => {
  return (
    <>
    {/* Pagination */}
    <div className="flex justify-center items-center gap-2 pt-6">
        {[1, 2, 3].map((num) => (
        <button 
            key={num}
            className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
            num === 1 ? "bg-[#6917AF] text-white shadow-md" : "bg-[#F1EEF9] text-[#172233] hover:bg-[#E5E0F3]"
            }`}
        >
            {num}
        </button>
        ))}
        <button className="px-4 cursor-pointer py-2 rounded-[10px] text-sm font-semibold text-[#707070] hover:text-[#6917AF] transition-colors">
        Next
        </button>
        <button className="px-4 py-2 cursor-pointer text-sm rounded-[10px] font-semibold text-[#707070] hover:text-[#6917AF] transition-colors">Last</button>
    </div>
  </>
  )
}

export default Pagination