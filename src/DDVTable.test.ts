import 'mocha';
import { assert } from 'chai';
import DDBTable, { TableKey } from './DDBTable';
import { GetQuery } from './queries';

interface DemoItem {
  Id: string;
  Ver: number;
  foo: number;
  inner: {
    obj: string;
  };
  maybe?: boolean;
  hidden: boolean;
}

describe('DDBTable', () => {
  it('TableKey type', () => {
    assert.ok<TableKey<DemoItem, 'Id'>>({
      Id: 'foo',
    });

    assert.ok<TableKey<DemoItem, 'Id', 'Ver'>>({
      Id: 'foo',
      Ver: 1,
    });
  });

  it('project(fields) type', () => {
    const table = new DDBTable<DemoItem, 'Id', 'Ver'>({
      tableName: 'MyTable',
      primaryKey: 'Id',
      sortKey: 'Ver',
    });

    const query = table
      .get('ss', 1)
      .project({ foo: false as boolean, maybe: 1 });

    assert.ok<
      GetQuery<
        Omit<DemoItem, 'foo' | 'hidden' | 'inner'> & { foo?: number },
        TableKey<DemoItem, 'Id', 'Ver'>
      >
    >(query);
  });

  it('project(fields) query', () => {
    const table = new DDBTable<DemoItem, 'Id', 'Ver'>({
      tableName: 'MyTable',
      primaryKey: 'Id',
      sortKey: 'Ver',
    });

    const query = table.get('ss', 1);

    assert.ok<Required<Parameters<typeof query.project>[0]>>({
      foo: 1,
      // Id2kk: true,
      maybe: true,
      hidden: false,
      inner: {
        obj: false,
      },
    });
  });

  it('Basic Usage', () => {
    const table = new DDBTable<DemoItem, 'Id', 'Ver'>({
      tableName: 'MyTable',
      primaryKey: 'Id',
      sortKey: 'Ver',
    });

    // table
    //   .get('ss', 1)
    //   .project({ foo: 1, Id2kk: true, maybe: true })
    //   .exec()
    //   .then((res) => {
    //     if (!res.Item) return;
    //
    //     console.log(res.Item.Id);
    //     console.log(res.Item.foo);
    //     console.log(res.Item.Ver);
    //     console.log(res.Item.maybe);
    //   });

    assert.deepEqual(
      table
        .get('ss', 1)
        .project({ foo: false as boolean, maybe: 1 })
        .serialize(),
      {
        TableName: 'MyTable',
        Key: {
          Id: 'ss',
          Ver: 1,
        },
        ProjectionExpression: '#maybe',
        ExpressionAttributeNames: {
          '#maybe': 'maybe',
        },
      },
    );
  });
});
