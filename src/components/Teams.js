import React from "react";
const join = require("array-join").join;

// We want this component to go get the teams from MLB's Stats API
// the request is a GET to `https://statsapi.mlb.com/api/v1/teams?season=2021&sportId=1`
// From there we want to display each team and the members of each team
// To get the members of each team we can call the stats API with the team ID
// GET to `http://statsapi.mlb.com/api/v1/teams/{teamId}/roster?rosterType=active`

class Teams extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mergedTeamsAndMembers: null
    };
  }

  componentDidMount() {
    this.getTeamsAndMembers();
  }

  getTeamsAndMembers = () => {
    fetch("https://statsapi.mlb.com/api/v1/teams?season=2021&sportId=1")
      .then((res) => {
        if (res.status >= 400) {
          throw new Error("Bad response from server");
        }
        return res.json();
      })
      .then((teams) => {
        let membersArray = [];

        Promise.all(
          teams?.teams.map((team) => {
            fetch(
              `https://statsapi.mlb.com/api/v1/teams/${team.id}/roster?rosterType=active`
            )
              .then((res) => {
                if (res.status >= 400) {
                  throw new Error("Bad response from server");
                }
                return res.json();
              })
              .then((members) => {
                membersArray.push(members);
              })
              .then(() => {
                this.formatData(teams?.teams, membersArray);
              })
              .catch((err) => {
                console.log(err);
              });
          })
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  formatData(teams, members) {
    // I wanted to use the array-join library here to help with relational matching via id's
    let result = join(teams, members, { key1: "id", key2: "teamId" });
    this.setState({ mergedTeamsAndMembers: result });
  }

  // I'll be making use of the bootstrap accordion since it was included in dependencies to help with display of the data.
  render() {
    const { mergedTeamsAndMembers } = this.state;
    return (
      <>
        <h1>Teams</h1>
        <div className="accordion" id="accordionExample">
          {mergedTeamsAndMembers &&
            mergedTeamsAndMembers.map((team) => {
            console.log(team)
              return (
                <>
                  <div className="accordion-item">
                    <h2 className="accordion-header" id={`heading${team.id}`}>
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse${team.id}`}
                        aria-expanded="false"
                        aria-controls={`#collapse${team.id}`}
                      >
                        <p
                          className="team-name"
                          key={`${team.name}-${team.id}`}
                        >
                          {team.name}
                        </p>
                      </button>
                    </h2>
                    <div
                      id={`collapse${team.id}`}
                      className="accordion-collapse collapse"
                      aria-labelledby={`heading${team.id}`}
                      data-bs-parent="#accordionExample"
                    >
                      <div className="accordion-body">
                        {team.roster.map((member) => {
                          return (
                            <p
                              className="player-name"
                              key={`${member.person.id}-${member.parentTeamId}`}
                            >
                              {member.person.fullName}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              );
            })}
        </div>

        {/* <p>
          Fork this template from
          [codesandbox.io](https://codesandbox.io/s/react-interview-j63bl).
        </p>
        <h2>Prompt</h2>
        <p>
          We want this component to go get the teams from MLB's Stats API - GET to{" "}
          <pre>
            https://statsapi.mlb.com/api/v1/teams?season=2021&amp;sportId=1
          </pre>{" "}
          From there we want to display each team and the members of each team. To
          get the members of each team call the stats API with the team ID - GET
          to{" "}
          <pre>
            http://statsapi.mlb.com/api/v1/teams/&lt;teamId&gt;/roster?rosterType=active
          </pre>
        </p>
        <h2>Bonus</h2>
        <p>
          Add some styling to the component to make it more presentable or create
          one or two unit tests for the project.
        </p> */}
      </>
    );
  }
}

export default Teams;
