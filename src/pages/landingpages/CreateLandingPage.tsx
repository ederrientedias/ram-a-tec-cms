import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { useLandingPageFunds } from '@/hooks/firestore/funds/use-landingpage';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Pencil, Plus } from 'lucide-react';


const CreateLandingPage = () => {
  const { data: landingPages, error, isLoading } = useLandingPageFunds();
  return (
    <div className="flex flex-col gap-4 mt-12">
      <div className="flex items-end gap-2 justify-end">
        {/* onClick={() => openDialog()} disabled={!selectedFund} */}
        <Button type="button">
          <Plus className="h-4 w-4" />
          Nova Landing Page
        </Button>
      </div>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome da Aba</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                  <Skeleton className="h-[50px] w-full" />
                </TableCell>
              </TableRow>
            ) : (
              landingPages?.map((data) => {
                return (
                  <TableRow>
                    <TableCell>{data.id}</TableCell>
                    <TableCell>{data.name}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                );
              })
            )}

            {/* {!collectionMap || collectionMap.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                  Nenhum arquivo encontrado
                </TableCell>
              </TableRow>
            ) : isFileLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                  <Skeleton className="h-[50px] w-full" />
                </TableCell>
              </TableRow>
            ) : (
              collectionMap.map((collection) => (
                <TableRow key={collection.id}>
                  <TableCell>{collection.id}</TableCell>
                  <TableCell>{collection.displayName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(collection)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => openAlert(collection)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )} */}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
export default CreateLandingPage;
