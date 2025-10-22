import {Check, ChevronsUpDown, X} from "lucide-react";
import React, {useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Popover} from "@radix-ui/react-popover";
import {PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {cn} from "@/lib/utils";

type ComboBoxItemList = {
  value: string,
  label: string,
}

type ComboBoxProps = {
  item_list: ComboBoxItemList[],
  multiple?: boolean,
  values: string[],
  onChange: (value: string[]) => void
  size?: "sm" | "lg" | "default" | "icon" | null | undefined,
  disabled?: boolean
  disabledItems?: string[]
}

export default function ComboBox({
                                   item_list,
                                   multiple = false,
                                   values,
                                   onChange,
                                   disabled,
                                   disabledItems,
                                   size = "default"
                                 }: ComboBoxProps) {
  const [valuesList, setValuesList] = React.useState<string[]>(values)
  const [open, setOpen] = React.useState(false)

  useEffect(() => {
    onChange(valuesList)
  }, [valuesList]);

  return (
    <>
      {multiple && (
        <div>
          <p className="text-[0.8rem] text-muted-foreground">{values.length > 0 ? "" : "No items selected"}</p>
          <div className="flex flex-wrap items-center">
            {valuesList.map((item) => {
              const label = item_list.find(i => i.value === item)?.label || item;
              return (
                <div key={item} className="flex flex-row items-center mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-4 p-2 mr-2"
                    disabled={disabled}
                    onClick={() => {
                      setValuesList(valuesList.filter((value) => value !== item))
                    }}
                  >
                    <span className="text-xs">{label}</span><X className="h-2 w-2"/>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>)}
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size={size}
            role="combobox"
            disabled={disabled}
            className={cn(
              "w-full justify-between",
              !valuesList && "text-muted-foreground"
            )}
          >
            {valuesList.length < 0
              ? item_list.find(
                (item) => valuesList.includes(item.value)
              )?.value
              : multiple === false ? valuesList.length === 1 ? item_list.find(item => item.value === valuesList[0])?.label : "Select Item ..." : "Select Item ..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit max-w-parent p-0">
          <Command>
            <CommandInput placeholder="Search item..."/>
            <CommandList>
              <CommandEmpty>No items found.</CommandEmpty>
              <CommandGroup>
                {item_list.map((item) => (
                  <CommandItem
                    value={`${item.value} ${item.label}`}
                    key={item.value}
                    onSelect={() => {
                      if (multiple) {
                        if (valuesList.includes(item.value)) {
                          setValuesList(valuesList.filter((value: string) => value !== item.value))
                        } else {
                          setValuesList([...valuesList, item.value])
                        }
                      } else {
                        setValuesList([item.value])
                        setOpen(false)
                      }
                    }}
                    disabled={disabledItems?.includes(item.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        valuesList.includes(item.value)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  )
}