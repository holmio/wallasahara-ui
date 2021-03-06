import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { QueryConfig } from '../../models/pagination.entities';
import * as _ from 'lodash';

/*
  Generated class for the PaginationService provider.

*/
@Injectable()
export class PaginationService {

  // Source data
  private done = new BehaviorSubject(false);
  private loading = new BehaviorSubject(false);
  private data = new BehaviorSubject([]);
  private query: QueryConfig;

  // Observable data
  itemsData$: Observable<any>;
  stateLoading$: Observable<boolean> = this.loading.asObservable();
  requestDone$: Observable<boolean> = this.done.asObservable();


  constructor(private afs: AngularFirestore) { }

  // Initial query sets options and defines the Observable
  // passing opts will override the defaults
  init(path: string, field: string, opts?: any) {
    this.query = {
      path,
      field,
      limit: 5,
      reverse: true,
      prepend: false,
      ...opts
    }

    const first = this.afs.collection(this.query.path, ref => {
      return ref
              .orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
              .limit(this.query.limit);
    })

    this.mapAndUpdate(first);

    // Create the observable array for consumption in components
    this.itemsData$ = this.data.asObservable()
        .scan( (acc, val) => {
          return this.query.prepend ? _.uniqBy(_.concat(val, acc), 'uuid') :  _.uniqBy(_.concat(acc, val), 'uuid');
        });
  }


  // Retrieves additional data from firestore
  more() {
    const cursor = this.getCursor();

    const more = this.afs.collection(this.query.path, ref => {
      return ref
              .orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
              .limit(this.query.limit)
              .startAfter(cursor);
    })
    this.mapAndUpdate(more);
  }

  // Retrieves additional data from firestores
  update() {
    const update = this.afs.collection(this.query.path, ref => {
      return ref
      .orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
      .limit(this.query.limit)
    })
    this.mapAndUpdate(update, true);
  }

  // Determines the doc snapshot to paginate query
  private getCursor() {
    const current = this.data.value;
    if (current.length) {
      return this.query.prepend ? current[0].doc : current[current.length - 1].doc;
    }
    return null;
  }


  // Maps the snapshot to usable format the updates source
  private mapAndUpdate(col: AngularFirestoreCollection<any>, updating: boolean =  false) {

    if (!updating && (this.done.value || this.loading.value)) { return };

    // loading
    this.loading.next(true);

    // Map snapshot with doc ref (needed for cursor)
    return col.snapshotChanges()
      .do(arr => {
        let values = arr.map(snap => {
          const data = snap.payload.doc.data();
          const doc = snap.payload.doc;
          return { ...data, doc };
        });

        // If prepending, reverse the batch order
        values = this.query.prepend ? values.reverse() : values;

        // update source with new values, done loading
        this.data.next(values);
        this.loading.next(false);

        // no more values, mark done
        if (!values.length) {
          this.done.next(true);
        }
    })
    .take(1)
    .subscribe();
  }

}
