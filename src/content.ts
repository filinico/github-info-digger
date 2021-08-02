import { Octokit } from "octokit";
// This file is injected as a content script
console.log("Hello from content script!")

const successCheckMark = "<a class=\"color-text-success tooltipped tooltipped-e\" aria-label=\"67 / 67 checks OK\" href=\"/coupa/treasury_tm5/pull/1065#partial-pull-merging\">\n" +
    "<svg class=\"octicon octicon-check v-align-middle\" viewBox=\"0 0 16 16\" version=\"1.1\" width=\"16\" height=\"16\" aria-hidden=\"true\"><path fill-rule=\"evenodd\" d=\"M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z\"></path></svg>\n" +
    "</a>"

const failedCheckMark = "<a class=\"color-text-danger tooltipped tooltipped-e\" aria-label=\"58 / 65 checks OK\" href=\"/coupa/treasury_tm5/pull/1049#partial-pull-merging\">\n" +
    "<svg class=\"octicon octicon-x v-align-middle\" viewBox=\"0 0 16 16\" version=\"1.1\" width=\"16\" height=\"16\" aria-hidden=\"true\"><path fill-rule=\"evenodd\" d=\"M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z\"></path></svg>\n" +
    "</a>"

const getInfos = (octokit: Octokit, useJenkins: boolean) =>{
    const ownerElement = document.querySelector('span[itemprop=author] a')
    const repoElement = document.querySelector('strong[itemprop=name] a')
    const pullsElements = document.querySelectorAll('.js-navigation-container.js-active-navigation-container div.js-navigation-item')
    if (ownerElement && repoElement && pullsElements){
        const owner = ownerElement.textContent
        const repo = repoElement.textContent
        console.log("Owner , %s", owner);
        console.log("Repo , %s", repo);
        if (owner && repo){
            for (let i = 0; i < pullsElements.length; i++) {
                const nodeElement = pullsElements[i]
                const nodeElementId = nodeElement.id
                const pullId = nodeElementId.substring(nodeElementId.indexOf("_") + 1)
                const pullContainer = nodeElement.querySelector("div.d-flex div.flex-auto")
                const dataContainer = document.createElement("div");
                dataContainer.className = "d-flex mt-1 text-small color-text-secondary";
                if (pullContainer){
                    pullContainer.append(dataContainer)
                    octokit.rest.pulls.listReviews({
                        owner,
                        repo,
                        pull_number: parseInt(pullId),
                    }).then((res)=>{
                        const reviews = res.data
                        if (reviews.length){
                            const approvals = reviews.filter(review => review.state == "APPROVED").length
                            const requestedChanges = reviews.filter(review => review.state == "CHANGES_REQUESTED").length
                            console.log("%s - %s approvals, %s requested changes", pullId, approvals, requestedChanges);
                            const reviewsContainer = document.createElement("span");
                            reviewsContainer.className = "d-inline-block ml-1";
                            if (approvals === 0 && requestedChanges === 0){
                                reviewsContainer.innerHTML = "• No Reviews"
                            }
                            else{
                                let reviewsContent = "• Reviewers: "
                                if (approvals > 0){
                                    reviewsContent += `${approvals} \n` + successCheckMark
                                }
                                if (approvals > 0 && requestedChanges > 0){
                                    reviewsContent += "\n and "
                                }
                                if (requestedChanges > 0){
                                    reviewsContent += `${requestedChanges} \n` + failedCheckMark
                                }
                                reviewsContainer.innerHTML = reviewsContent
                            }

                            dataContainer.append(reviewsContainer)
                        }
                        else{
                            console.log("%s - No Reviews", pullId);
                            const reviewsContainer = document.createElement("span");
                            reviewsContainer.className = "d-inline-block ml-1";
                            reviewsContainer.innerHTML = "• No Reviews"
                            dataContainer.append(reviewsContainer)
                        }
                    })
                    octokit.rest.pulls.get({
                        owner,
                        repo,
                        pull_number: parseInt(pullId),
                    }).then((res)=>{
                        const targetBranch = res.data.base.ref
                        console.log("targetBranch, %s", targetBranch);
                        const targetBranchContainer = document.createElement("span");
                        targetBranchContainer.className = "d-inline-block ml-1";
                        targetBranchContainer.innerHTML = `• ${targetBranch}`
                        dataContainer.append(targetBranchContainer)
                        if (useJenkins){
                            const commitId = res.data.head.sha
                            octokit.rest.repos.listCommitStatusesForRef({
                                owner,
                                repo,
                                ref: commitId,
                            }).then((res)=>{
                                const statuses = res.data
                                const prBuild = statuses.find(status => status.context === "continuous-integration/jenkins/pr-merge")
                                const prBuildContainer = document.createElement("span");
                                prBuildContainer.className = "d-inline-block ml-1";
                                dataContainer.append(prBuildContainer)
                                if (prBuild && prBuild.state === "success"){
                                    prBuildContainer.innerHTML = "• PR Build: \n" + successCheckMark
                                }
                                else{
                                    prBuildContainer.innerHTML = "• PR Build: \n" + failedCheckMark
                                }
                            })
                        }
                    })
                }
            }
        }
    }
}

const getAuthenticated = (token:string): Octokit=>{
    const octokit = new Octokit({ auth: token });
    octokit.rest.users.getAuthenticated().then((res)=>{
        console.log("Hello, %s", res.data.login);
    })
    return octokit
}

chrome.storage.sync.get(['token', 'useJenkins'], (data) => {
    console.log('Value is set to ' + data.token);
    if (data.token && data.token !== ""){
        const octokit = getAuthenticated(data.token)
        getInfos(octokit, data.useJenkins)
    }
    else{
        console.log('Token not setup.');
    }
});


