let myStorage = window.localStorage;

// to convert '\n' in bio of user to <br> tag
function convert_newLine_to_br(bio){
    const splitted_text = bio.split("\n");
    return splitted_text.join("<br>")
}
// this function replace null item with '-----'
function handle_null_item(item){
    if(item === null || item == "null")
        return '-----';
    else
        return item;
}

//this function return most frequent item in an array and is used to find favourite language of user
function mode(array)
{
    if(array.length == 0)
        return null;
    let modeMap = {};
    let maxEl = array[0], maxCount = 1;
    for(let i = 0; i < array.length; i++)
    {
        let el = array[i];
        if(modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;
        if(modeMap[el] > maxCount)
        {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}

// fetching favourite language from repositories of user and send favourite language with dom to page
function find_favourite_language(repos_url, username){
    fetch(repos_url)
        .then((result) => result.json())
        .then((data) => {
            const languages_list = [];
            for (let i=0; i<data.length; i++){
                if(data[i].language !== null)
                    languages_list.push(data[i].language);
                if(i == 4)
                    break;
            }
            const favourite_language = mode(languages_list);
            document.getElementById("favourite_language").innerHTML = "Favourite Language: "+ favourite_language;
            myStorage.setItem(`${username}_language`, favourite_language);
        })
}


// show information of user and handle username error and set item in local storage
function show_user_info(data, username, use_local_storage){
    if(data.name === undefined){
        document.getElementById('error').setAttribute('style','display:block')
        document.getElementById('username').classList.add('red-border')
    }
    else{
        document.getElementById('error').setAttribute('style','display:none')
        document.getElementById('username').classList.remove('red-border')
        document.getElementById("user-image").src =data.avatar_url;
        const name = handle_null_item(data.name);
        const blog = handle_null_item(data.blog);
        const location = handle_null_item(data.location);
        document.getElementById("user-info").innerHTML = `
                <p>name:  ${name}</p>
                <p>blog:  ${blog}</p>
                <p>location:  ${location}</p>
                 `;
        let user_bio = "----";
        if(data.bio !== null){
            user_bio = convert_newLine_to_br(data.bio);
        }
        document.getElementById("user-bio").innerHTML = "bio:  " + user_bio;
        if(!use_local_storage){
            myStorage.setItem(`${username}_avatar_url`, data.avatar_url);
            myStorage.setItem(`${username}_name`, name);
            myStorage.setItem(`${username}_blog`, blog);
            myStorage.setItem(`${username}location`, location);
            myStorage.setItem(`${username}_bio`, user_bio);
            myStorage.setItem(username, username);
        }
    }
}
// save local storage data to a dict
function ready_data(username){
    let dict = {};
    dict["avatar_url"] = myStorage.getItem(`${username}_avatar_url`);
    dict["name"] = myStorage.getItem(`${username}_name`);
    dict["blog"] = myStorage.getItem(`${username}_blog`);
    dict["location"] = myStorage.getItem(`${username}location`);
    dict["bio"] = myStorage.getItem(`${username}_bio`);
    dict["language"] = myStorage.getItem(`${username}_language`);
    return dict;
}

// in this function we fetch data from github api and if this information exist in local storage we get data from local storage
function get_user_info(url, username){
    let use_local_storage = false;
    if(myStorage.getItem(username)){
        const data = ready_data(username);
        show_user_info(data, username, true);
        document.getElementById("favourite_language").innerHTML = "Favourite Language: "+ data.language;
        console.log("mahdi");
    }
    else {
        fetch(url)
            .then((result) => result.json())
            .then((data) => {
                show_user_info(data, username,use_local_storage);
                if(data.name !== undefined) {
                    find_favourite_language(data.repos_url, username);
                }

            })
    }

}



let form = document.getElementById("search-form")

form.addEventListener('submit', function(e){
    e.preventDefault();
    let username = document.getElementById("username").value
    let url = `https://api.github.com/users/${username}`;
    get_user_info(url, username);


})