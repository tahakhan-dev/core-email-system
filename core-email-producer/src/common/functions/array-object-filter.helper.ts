import { Injectable } from "@nestjs/common";

@Injectable()
export class FilterFunctions {
    public filterArray<T>(result: T[], args: string[]): T[] { // this take two parameter 1) result: An array of objects of type T that needs to be filtered. 2). args: An array of strings representing the user-defined arguments used for filtering.
        // Filter the array based on user-defined arguments
        return result?.map((item) => {  //  map function is applied to the result array. This allows iterating over each item in the array and performing a transformation
            const filteredItem: Partial<T> = {};
            Object?.keys(item)?.forEach((key) => { // The Object.keys(item) function retrieves an array of keys from the current item in the iteration. This allows iterating over each property of the item.
                if (!args?.includes(key)) {
                    filteredItem[key] = item[key];
                }
            });
            return filteredItem as T;  // Once all properties have been processed, the filteredItem is returned as a result of the map function. It is casted back to type T using the as T syntax to ensure the return type matches the original item type.
        });
    }
}
