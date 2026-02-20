import { ScrollArea } from '@/components/ui/scroll-area';
import A4Canvas from './A4Canvas';
import Lamina from './lamina';
import { PageA4 } from './lamina/PageA4';
import LaminaEditor from './lamina/LaminaEditor';

const createOnePager = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium font-serif text-rz-black">One Pager</h1>
      </div>
      <div className="grid grid-cols-12 gap-2 h-full">
        <div className="col-span-12 w-full h-full max-h-[calc(100vh-120px)]">
          <ScrollArea className="h-full w-full">
            {/* <LaminaEditor /> */}
            {/* <A4Canvas /> */}
            <Lamina />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
export default createOnePager;
