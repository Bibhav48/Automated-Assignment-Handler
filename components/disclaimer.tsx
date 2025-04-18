const Disclaimer = () => {
  return (
    <div className="bg-gray-100 p-4 pb-6 pt-2 rounded-lg shadow-md max-w-2xl mx-auto flex flex-col items-center">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="30" 
        height="30" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="lucide lucide-circle-alert text-red-500"
      >
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" x2="12" y1="8" y2="12"/>
        <line x1="12" x2="12.01" y1="16" y2="16"/>
      </svg>
      <p className="text-sm text-black mt-2">
        <b>Instant Assignments</b> is a project developed strictly for educational purposes and as a submission for the <b>Next.js Hackathon</b>. As students, we do not endorse or recommend the use of this tool for completing assignments or bypassing academic responsibilities. Misusing such tools is unethical, and we <b>strongly discourage it.</b>
      </p>
    </div>
  );
}

export default Disclaimer;