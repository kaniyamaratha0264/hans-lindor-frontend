import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import io from "socket.io-client";
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

declare var google: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  // @ViewChild("placesRef") placesRef : GooglePlaceDirective;
  title = 'tracking';
  lat = 21.2074274;
  lng = 72.7924497;
  lat1 = 0;
  lng1 = 0;
  OriginAddress: string = ''
  OriginLatitude: string = ''
  OriginLongitude: string = ''
  DestinationAddress: string = ''
  DestinationLatitude: string = ''
  DestinationLongitude: string = ''
  dir:any;
  watchId: any;
  myId: any;
  userId: any;
  id: any = 1;
  socket:any = "";
  constructor(private route: ActivatedRoute){

  }
  ngOnInit(): any {
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
          this.lat= position.coords.latitude;
          this.lng= position.coords.longitude;
      });
    }
    this.socket = io("https://hans-lindor-backend.vercel.app");
  }
  async ngAfterViewInit() {
    console.log(this.route.snapshot.paramMap.get('id'));
    if (navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition((position) =>
      {
        console.log(position);
        this.lat= position.coords.latitude;
        this.lng= position.coords.longitude;
        let data: any = {
          lat: this.lat,
          lng: this.lng,
          informUserId: this.userId
        }
        this.socket.emit("changeLocation", data, (error: any) => {

        });
      },(err: any) =>
      {
          console.log(err);
      },);
    }

    return this.socket.on("receivedlocation", (data: any) => {
      this.lat1 = data.lat;
      this.lng1 = data.lng;
      console.log(this.lat1, this.lng1);
      this.dir = {
        origin: { lat: this.lat, lng: this.lng },
        destination: { lat: data.lat, lng: data.lng }
      }
    });
  }
  getId(event: any, index: number) {
    if(index == 1) {
      this.myId = event.target.value;
    } else {
      this.userId = event.target.value;
    }
    if(this.myId && this.userId) {
      console.log(this.id, this.myId)
      if(this.myId == 1) {
        let data: any = {
          myId: this.myId,
          userId: this.userId
        }
        this.socket.emit("join", data, (error: any) => {
          if (error) {
            alert(error);
          } else {
          }
        });
      } else {
        this.socket.emit("hostjoin", this.userId, (error: any) => {
          if (error) {
            alert(error);
          } else {
          }
        });
      }
    }
  }
  handleOriginAddressChange(address: any) {
    this.OriginAddress = address.formatted_address
    this.OriginLatitude = address.geometry.location.lat()
    this.OriginLongitude = address.geometry.location.lng()
    this.lat = parseFloat(this.OriginLatitude)
    this.lng = parseFloat(this.OriginLongitude)
  }
  handleDestinationAddressChange(address: any) {
    this.DestinationAddress = address.formatted_address
    this.DestinationLatitude = address.geometry.location.lat()
    this.DestinationLongitude = address.geometry.location.lng()
    this.lat1 = parseFloat(this.DestinationLatitude)
    this.lng1 = parseFloat(this.DestinationLongitude)
    this.getDirection()

  }
  public getDirection() {
    this.dir = {
      origin: { lat: this.lat, lng: this.lng },
      destination: { lat: this.lat1, lng: this.lng1 }
    }
  }
  ngOnDestory() {
    navigator.geolocation.clearWatch(this.watchId);
  }
}
