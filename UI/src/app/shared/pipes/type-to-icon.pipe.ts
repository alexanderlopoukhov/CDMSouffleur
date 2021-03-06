import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'typeToIcon'
})
export class TypeToIconPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    switch (value.toLowerCase()) {
      case 'numeric':
      case 'integer': {
        return '“”';
      }
      case 'date': {
        return 'date_range';
      }
      default:
        return '#';
    }
  }

}
