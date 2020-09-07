import { ArrowCache, Arrow, ConstantCache } from './arrow-cache';
import { groupBy } from '../infrastructure/utility';
import { MappingPair, MappingNode, Mapping } from './mapping';
import { IConnection } from '../services/bridge.service';
import { IRow } from './row';

export class MappingService {
  connections: Array<IConnection>;
  constants: Array<IRow>;
  sourceTableName: string;

  constructor(arrowCache: ArrowCache, constants: ConstantCache, sourceTableName: string) {
    if (!arrowCache) {
      throw new Error('data should be not empty');
    }
    this.connections = Object.values(arrowCache);
    this.constants = Object.values(constants);
    this.sourceTableName = sourceTableName;
  }

  generate(): Mapping {
    const merged = this.connections
      .filter(arrow => {
        let condition = arrow.target.tableName !== 'similar';
        if (this.sourceTableName) {
          condition = condition && arrow.source.tableName === this.sourceTableName;
        }
        return condition;
      })
      .map(arrow => {
        return {
          transforms: arrow.transforms,
          sourceTable: arrow.source.tableName,
          sourceColumn: arrow.source.name,
          targetTable: arrow.target.tableName,
          targetColumn: arrow.target.name,
          lookup: arrow.lookup ? arrow.lookup['name'] : ''
        };
      });

    const bySource = groupBy(merged, 'sourceTable');

    const mapPairs: MappingPair[] = [];

    Object.keys(bySource).forEach(sourceTable => {
      const byTargetTable = groupBy(bySource[sourceTable], 'targetTable');
      Object.keys(byTargetTable).forEach(targetTable => {
        const mappings = [];

        byTargetTable[targetTable].map(arrow => {
          const node: MappingNode = {
            source_field: arrow.sourceColumn,
            target_field: arrow.targetColumn,
            sql_field: arrow.sourceColumn,
            sql_alias: arrow.targetColumn,
            lookup: arrow.lookup
          };

          this.applyTransforms(node, arrow);

          mappings.push(node);
        });
        mapPairs.push({
          source_table: sourceTable,
          target_table: targetTable,
          mapping: mappings
        });
      });
    });

    this.applyConstant(mapPairs, this.constants);

    const mapping: Mapping = Object.create(null);
    mapping.mapping_items = mapPairs;

    return mapping;
  }

  applyTransforms(node: MappingNode, connector: any) {
    node.sql_field = connector.transforms.reduce((acc, transform) => {
      return transform.getSql(acc, transform);
    }, node.sql_field);
  }

  applyConstant(mapPairs: any[], rows: IRow[]) {
    const mappings = mapPairs.map(x => x.mapping);
    mappings.forEach((mapping: any[]) => {
      rows.forEach(row => {
        const constantObj = {
          source_field: '',
          sql_field: row.constant,
          sql_alias: row.name,
          target_field: row.name
        };
        mapping.push(constantObj);
      });
    });
  }
}
