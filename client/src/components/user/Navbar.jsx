import {Timer} from "lucide-react";
const Navbar=()=>{
    return <div className="w-full h-12 border-b border-nuetral-800/30 flex items-center justify-between">
       <div className="flex gap-2 px-4 items-center">
            <span className="font-semibold">Logiq</span>
            <div  className="w-px bg-red-900 h-4"/>
            <span className="font-semibold">IDCC</span>
       </div>
       <div className="flex gap-2 px-4">
        <div>
        <Timer />
            <button>Time</button>
        </div>
        <div>
            <button className="py-2  px-3 bg-red-900 rounded">finish</button>
        </div>
       </div>
    </div>
}

export default Navbar;