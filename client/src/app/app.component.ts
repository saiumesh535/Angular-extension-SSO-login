import { Component } from '@angular/core';


declare var chrome;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public login(): void {
    try {
      chrome.extension.getBackgroundPage().console.log(`http://localhost:3000/login?redirectURI=https://${chrome.runtime.id}.chromiumapp.org`)
      chrome.identity.launchWebAuthFlow(
        { url: `http://localhost:3000/login?redirectURI=https://${chrome.runtime.id}.chromiumapp.org`, interactive: true },
        (redirectURL) => {
          chrome.extension.getBackgroundPage().console.log('result', redirectURL);
        });
    } catch (err) {
      console.error(err);
    }
  }
}
