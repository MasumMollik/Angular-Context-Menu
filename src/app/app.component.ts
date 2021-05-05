import {Component,
  ViewChild,
  TemplateRef,
  ViewContainerRef,
  HostListener } from '@angular/core';
// @ts-ignore
import faker from "faker";

import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { fromEvent, Subscription } from "rxjs";
import { take, filter } from "rxjs/operators";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  users = Array.from({ length: 10 }, () => ({
    name: faker.name.findName()
  }));
  // @ts-ignore
  sub: Subscription;
  selectedUser = '';
  outer = false;
  inside = false;
  // @ts-ignore
  @ViewChild('userMenu', {read: TemplateRef, static: true}) userMenu: TemplateRef<unknown>;
// @ts-ignore
  overlayRef: OverlayRef | null;

  constructor(
    public overlay: Overlay,
    public viewContainerRef: ViewContainerRef
  ) {}

  checkinside($event: MouseEvent, user: any): void{
    $event.stopPropagation();
    console.log('clicked inside');
    this.open($event, user);
  }

  @HostListener('document:contextmenu', ['$event']) clickedOutside($event: MouseEvent): void{
    // here you can hide your menu
    console.log('CLICKED OUTSIDE');
    this.open($event, { name: 'outsider context' });
  }

  open({ x, y }: MouseEvent, user: any): void {
    this.close();
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo({ x, y })
      .withPositions([
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top'
        }
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close()
    });

    this.overlayRef.attach(
      new TemplatePortal(this.userMenu, this.viewContainerRef, {
        $implicit: user
      })
    );
    this.selectedUser = user;

    this.sub = fromEvent<MouseEvent>(document, 'click')
      .pipe(
        filter(event => {
          const clickTarget = event.target as HTMLElement;
          return (
            !!this.overlayRef &&
            !this.overlayRef.overlayElement.contains(clickTarget)
          );
        }),
        take(1)
      )
      .subscribe(event => {
        this.close();
        // console.log("sub", event.x, event.y);
      });
  }

  delete(user: any): void {
    // delete user
    this.close();
  }

  close(): void {
    // tslint:disable-next-line:no-unused-expression
    this.sub && this.sub.unsubscribe();
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
    this.outer = false;
    this.inside = false;
  }
}
