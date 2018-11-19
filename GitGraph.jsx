import React, {Component} from 'react';
import ReactEcharts from 'echarts-for-react';

class GitGraph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            width: props.width || 960,
            height: props.height || 480,
            pullRequests: props.pullRequests,
        };
        this.getPullRequestsConvertedToEchartsFormat = this.getPullRequestsConvertedToEchartsFormat.bind(this);
    }

    getPullRequestsConvertedToEchartsFormat() {
        let nestedBranches = GitGraph.getNestedBranches(this.state.pullRequests);
        let convertedBranches = [];
        Object.getOwnPropertyNames(nestedBranches).forEach(key => {
            convertedBranches.push(GitGraph.convertNestedBranchToEchartsFormat(nestedBranches[key], key));
        });
        return convertedBranches;
    }

    static convertNestedBranchToEchartsFormat(nestedBranch, name) {
        let echartsFormat = {
            name: name,
            children: [],
        };
        Object.getOwnPropertyNames(nestedBranch).forEach(key => {
            echartsFormat.children.push(GitGraph.convertNestedBranchToEchartsFormat(nestedBranch[key], key));
        });
        return echartsFormat;
    }

    static getNestedBranches(pullRequests) {
        let sourceBranches = pullRequests.map(pullRequest => pullRequest.source);
        let targetBranches = pullRequests.map(pullRequest => pullRequest.target);

        let nestedBranches = {};
        targetBranches.forEach((target) => {
            if (sourceBranches.indexOf(target) === -1 && !nestedBranches.hasOwnProperty(target)) {
                nestedBranches[target] = GitGraph.getChildBranches(pullRequests, target);
            }
        });

        return nestedBranches;
    }

    static getChildBranches(pullRequests, source) {
        let children = {};
        pullRequests.forEach((possibleChild) => {
            if (possibleChild.target === source) {
                children[possibleChild.source] = GitGraph.getChildBranches(pullRequests, possibleChild.source)
            }
        });

        return children;
    }

    static getDerivedStateFromProps(props, state) {
        return {
            pullRequests: props.pullRequests,
        };
    }

    render() {
        let data = this.getPullRequestsConvertedToEchartsFormat();

        let numberOfDatum = Object.keys(data).length;

        return (
            <div>
                {data.map(function (datum, index) {
                    let option = {
                        tooltip: {
                            trigger: 'item',
                            triggerOn: 'mousemove'
                        },
                        series: [
                            {
                                type: 'tree',

                                data: [datum],

                                top: '1%',
                                left: '1%',
                                bottom: '1%',
                                right: '20%',

                                symbolSize: 7,

                                label: {
                                    normal: {
                                        position: 'right',
                                        verticalAlign: 'top',
                                        align: 'left',
                                        fontSize: 9
                                    }
                                },

                                leaves: {
                                    label: {
                                        normal: {
                                            position: 'right',
                                            verticalAlign: 'middle',
                                            align: 'left'
                                        }
                                    }
                                },

                                expandAndCollapse: true,
                                animationDuration: 550,
                                animationDurationUpdate: 750
                            }
                        ]
                    };
                    return <ReactEcharts
                        key={index}
                        style={{height: this.state.height / numberOfDatum, width: '100%'}}
                        option={option} />;
                }.bind(this))}
            </div>
        );
    }
}

export default GitGraph;
