<img width="219" height="83" alt="3" src="https://github.com/user-attachments/assets/3595694c-46a3-4729-863e-9eb878d6f9d2" />


<br>

#### A lightweight Chrome extension that displays the expected value (EV) of crafting Steam trading card badges directly on app's page.
>
> - It fetches current marketplace prices for cards, backgrounds, and emoticons, calculates weighted averages. 
> - Returns an expected profit or loss on each craft with a link to the app's badge page.

#### Weighted EV Calculation
Open 
 Uses the steam badge craft probability distribution to compute:
>  Average background value
> <br> Average emoticon value
> <br> Total EV = (bgEV + emoEV) − crafting cost


##### ⚠️ Currently working on reducing avoidable requests to prevent 429 STATUS. (rates: 20 per minute, 1000 per day).
##### TODO (12.07): Use cached results of frequently fetched results & abort the further fetching when one fails & letting the user configure the threshold of refetching.


