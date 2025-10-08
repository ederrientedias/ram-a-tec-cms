import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


export const AssetDatail = ({ data }) => {
  const sections =
    data.steps.map((item: any) => data['forms'][item.title]).filter((e) => e !== undefined) ?? [];
  const firstSection = sections.find((f) => f.order === 0);

  return (
    <Tabs defaultValue={firstSection?.id} className="w-full">
      <TabsList className="w-full justify-between">
        {data?.steps.map((step: any) => {
          const isForm = data.forms[step.title];
          return (
            <TabsTrigger disabled={!isForm} key={step.id} value={step.id}>
              {step.title}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {sections.map((form) => {
        return (
          <TabsContent key={form.id} value={form.id} className="p-3 mt-4">
            {form?.metadata.keys.map((item) => (
              <div
                key={item?.key}
                className="flex justify-between py-2 border-b border-dashed border-slate-200"
              >
                <span>{item?.label}</span>
                <span>{String(form.data[item.key] ?? 'N/A')}</span>
              </div>
            ))}
          </TabsContent>
        );
      })}
    </Tabs>
  );
};
