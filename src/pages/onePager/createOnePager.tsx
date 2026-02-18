const createOnePager = () =>  {
  return (
     <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium font-serif text-rz-black">One Pager</h1>
      </div>
       <div className="grid grid-cols-2 gap-4">
         <div className="bg-rz-beige/40 p-4 rounded-md">
           <h2 className="text-lg font-medium font-serif text-rz-black">Título do One Pager</h2>
         </div>
       </div>
    </div>
  );
}
export default createOnePager;
